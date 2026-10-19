#!/usr/bin/env python3
"""Verify the real SQLite model data and live Django/Flask services."""
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
import sys
sys.path.insert(0, str(ROOT / 'server'))

import django
django.setup()
from django.contrib import admin
from djangoapp.models import CarMake, CarModel


def fetch(url):
    try:
        with urlopen(url, timeout=12) as response:
            if response.status != 200:
                raise RuntimeError(f'HTTP {response.status}: {url}')
            return json.loads(response.read().decode())
    except (URLError, HTTPError) as exc:
        raise RuntimeError(f'Endpoint unavailable: {url}: {exc}') from exc


def check(condition, message):
    if not condition:
        raise RuntimeError('FAIL: ' + message)
    print('PASS:', message)


def main():
    makes_count = CarMake.objects.count()
    models_count = CarModel.objects.count()
    check(makes_count > 0, f'{makes_count} CarMake records in Django SQLite')
    check(models_count > 0, f'{models_count} CarModel records in Django SQLite')
    check(CarMake in admin.site._registry and CarModel in admin.site._registry,
          'Both models registered in Django Admin')
    models = fetch('http://127.0.0.1:8000/djangoapp/get_cars')
    carmodels = models.get('CarModels', [])
    check(len(carmodels) == models_count, f'/djangoapp/get_cars returned {len(carmodels)} models')
    check(all('CarMake' in c and 'CarModel' in c for c in carmodels),
          'CarMake and CarModel keys available for review form')
    makes = fetch('http://127.0.0.1:8000/djangoapp/get_carmakes')
    check(len(makes.get('CarMakes', [])) == makes_count, 'CarMake list endpoint returns stored makes')
    text = 'Fantastic services'
    sentiment = fetch('http://127.0.0.1:5050/analyze/' + quote(text, safe=''))
    check(sentiment.get('sentiment') == 'positive',
          'Flask VADER /analyze/Fantastic services returned positive')
    proxy = fetch('http://127.0.0.1:8000/djangoapp/analyze_review?text=' + quote(text, safe=''))
    check(proxy.get('sentiment') == 'positive', 'Django sentiment proxy returned positive')
    print('PASS: Q14–Q16 real integration verified')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        raise SystemExit(str(exc))

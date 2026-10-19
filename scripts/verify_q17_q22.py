#!/usr/bin/env python3
"""Read-only live integration checks of the Q17-Q22 Django dealer endpoints."""
import os
import sys
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')

import django  # noqa: E402

django.setup()
from django.test import Client, override_settings  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from djangoapp.models import CarModel  # noqa: E402


def assert_pass(condition, label):
    if not condition:
        raise AssertionError('FAIL: ' + label)
    print('PASS:', label)


def main():
    with override_settings(ALLOWED_HOSTS=['testserver', '127.0.0.1']):
        client = Client()
        all_response = client.get('/djangoapp/get_dealers')
        assert_pass(all_response.status_code == 200 and len(all_response.json().get('dealers', [])) >= 50, 'Q17 50+ dealerships via Django -> Express -> MongoDB')
        kansas = client.get('/djangoapp/get_dealers/Kansas')
        assert_pass(kansas.status_code == 200 and all(d.get('state') == 'Kansas' for d in kansas.json().get('dealers', [])) and len(kansas.json()['dealers']) >= 1, 'Q19 Kansas filtered dealers')
        dealer = client.get('/djangoapp/dealer/15')
        assert_pass(dealer.status_code == 200 and dealer.json().get('dealer', [{}])[0].get('id') == 15, 'Q20 dealer 15 details')
        reviews = client.get('/djangoapp/reviews/dealer/15')
        assert_pass(reviews.status_code == 200 and len(reviews.json().get('reviews', [])) >= 3, 'Q20 dealer 15 real reviews')
        assert_pass(all('sentiment' in r for r in reviews.json()['reviews']), 'Q20 review sentiment included')
        makes = client.get('/djangoapp/get_cars')
        assert_pass(makes.status_code == 200 and len(makes.json().get('CarModels', [])) >= 1, 'Q21 car make/model selection data')
        session = client.get('/djangoapp/session')
        assert_pass(session.status_code == 200 and session.json()['authenticated'] is False, 'Anonymous session is not authenticated')
        denied = client.post('/djangoapp/add_review', data='{}', content_type='application/json')
        assert_pass(denied.status_code == 401, 'Q22 review posting rejects anonymous users')

        # Validate the logged-in session and view-layer form validation without
        # actually inserting a review into MongoDB.
        User = get_user_model()
        name = 'capstone_q17_verify_' + uuid4().hex[:10]
        user = User.objects.create_user(name, password='DisposableTest2026!')
        try:
            client.force_login(user)
            session = client.get('/djangoapp/session')
            assert_pass(session.status_code == 200 and session.json()['userName'] == name, 'Q18 logged-in Django session')
            bad = client.post('/djangoapp/add_review', data='{}', content_type='application/json')
            assert_pass(bad.status_code == 400, 'Q21 review form validates required fields')
            assert_pass(CarModel.objects.exists(), 'Q21 CarModel records stored in Django')
        finally:
            user.delete()
    print('PASS: Q17-Q22 backend integration passed; use actual React browser to confirm Q17-Q22 screenshot evidence')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('FAIL:', exc)
        sys.exit(1)

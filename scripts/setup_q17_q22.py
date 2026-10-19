#!/usr/bin/env python3
"""Idempotent and backup-safe Q17-Q22 installer for the Skills Network project."""
from pathlib import Path
import ast
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
PATCH = ROOT / 'q17_q22_payload'
FRONTEND = ROOT / 'server/frontend/src'


def save(target):
    if target.exists():
        backup = ROOT / '.capstone_local_backups/q17_q22' / target.relative_to(ROOT)
        if not backup.exists():
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)


def install(path):
    source = PATCH / path
    target = ROOT / path
    if not source.exists():
        raise RuntimeError('Missing package source: ' + str(source))
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.read_bytes() != source.read_bytes():
        save(target)
        shutil.copy2(source, target)
        print('INSTALLED', path)
    else:
        print('UNCHANGED', path)


def append_once(source_name, target_name, marker):
    target = ROOT / target_name
    old = target.read_text()
    if marker in old:
        print('UNCHANGED', target_name, '(routes already present)')
        return
    save(target)
    fragment = (PATCH / source_name).read_text()
    updated = old.rstrip() + '\n' + fragment
    ast.parse(updated, filename=target_name)
    target.write_text(updated)
    print('INSTALLED', target_name, '(appended)')


def main():
    if not (ROOT / 'server/djangoapp/views.py').exists():
        sys.exit('STOP: run this script from the project ZIP root')
    # Preflight: do not modify a different version of the course project.
    views = (ROOT / 'server/djangoapp/views.py').read_text()
    required = ('def login_user(', 'def registration(', 'def get_cars(', 'def analyze_review(')
    if not all(item in views for item in required):
        sys.exit('STOP: Expected Q5-Q16 Django views are missing; do not modify files')
    routes = (ROOT / 'server/djangoapp/urls.py').read_text()
    if not all(p in routes for p in ("capstone_path('login'", "capstone_path('get_cars'")):
        sys.exit('STOP: Django URL routes do not match Q5-Q16 installation')
    for name in [
        'server/frontend/src/App.js',
        'server/frontend/src/components/Header/Header.jsx',
        'server/frontend/src/components/Header/Header.css',
        'server/frontend/src/components/Dealers/Dealers.jsx',
        'server/frontend/src/components/Dealers/Dealer.jsx',
        'server/frontend/src/components/Dealers/PostReview.jsx',
        'server/frontend/src/components/Dealers/Dealers.css',
        'server/frontend/src/components/Login/Login.jsx',
    ]:
        install(name)
    append_once('django_views_append.py.txt', 'server/djangoapp/views.py', '# BEGIN CAPSTONE DEALERS AND REVIEW WORKFLOW (Q17-Q22)')
    append_once('django_urls_append.py.txt', 'server/djangoapp/urls.py', '# BEGIN CAPSTONE DEALER AND REVIEW ROUTES (Q17-Q22)')
    print('PASS: Q17-Q22 pages and Django endpoints installed without touching the database')
    print('NEXT: python server/manage.py check, then restart Django and React only')


if __name__ == '__main__':
    main()

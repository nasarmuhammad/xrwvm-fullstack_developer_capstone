#!/usr/bin/env python3
"""Verify the real Mongo-backed dealership endpoints before capturing evidence."""
import json
import sys
import urllib.error
import urllib.request

BASE = 'http://127.0.0.1:3030'


def fetch(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as response:
            assert response.status == 200, (path, response.status)
            return json.load(response)
    except Exception as exc:
        raise SystemExit(f'FAIL: {path}: {exc}') from exc


def check():
    all_dealers = fetch('/fetchDealers')
    assert isinstance(all_dealers, list) and len(all_dealers) == 50, (
        f'Expected 50 dealership records; received {len(all_dealers)}')
    print('PASS Q9: /fetchDealers returned 50 dealers')

    dealer = fetch('/fetchDealer/1')
    assert isinstance(dealer, list) and len(dealer) == 1 and dealer[0]['id'] == 1
    print('PASS Q10: /fetchDealer/1 returned dealer ID 1')

    kansas = fetch('/fetchDealers/Kansas')
    assert isinstance(kansas, list) and len(kansas) > 0, 'No Kansas dealers found in seed data'
    assert all(d['state'].casefold() == 'kansas' for d in kansas)
    print(f'PASS Q11: /fetchDealers/Kansas returned {len(kansas)} Kansas dealer(s)')

    reviews = fetch('/fetchReviews/dealer/15')
    assert isinstance(reviews, list) and len(reviews) > 0, 'Expected reviews for dealer 15'
    assert all(r['dealership'] == 15 for r in reviews)
    print(f'PASS Q8: /fetchReviews/dealer/15 returned {len(reviews)} review(s)')
    print('PASS: Q8–Q11 live API verification complete')


if __name__ == '__main__':
    try:
        check()
    except (AssertionError, KeyError, ValueError) as exc:
        sys.exit(f'FAIL: {exc}')

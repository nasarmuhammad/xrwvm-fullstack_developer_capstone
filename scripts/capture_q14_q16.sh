#!/usr/bin/env bash
# Save cURL commands and actual server replies (never invent evidence).
set -euo pipefail
DEST=/home/project/capstone_submission/terminal_outputs
mkdir -p "$DEST"

echo "Saving $DEST/getallcarmakes"
{
  printf '$ curl -sS -w "\\nHTTP %%{http_code}\\n" http://127.0.0.1:8000/djangoapp/get_cars\n'
  curl --fail-with-body -sS -w '\nHTTP %{http_code}\n' http://127.0.0.1:8000/djangoapp/get_cars
  echo
} | tee "$DEST/getallcarmakes"

echo "Saving $DEST/analyzereview"
{
  printf '$ curl -sS -w "\\nHTTP %%{http_code}\\n" http://127.0.0.1:5050/analyze/Fantastic%%20services\n'
  curl --fail-with-body -sS -w '\nHTTP %{http_code}\n' 'http://127.0.0.1:5050/analyze/Fantastic%20services'
  echo
} | tee "$DEST/analyzereview"

echo 'PASS: Both authentic cURL outputs captured.'

#!/usr/bin/env bash
set -euo pipefail
BASE='http://127.0.0.1:3030'
OUT='/home/project/capstone_submission/terminal_outputs'
mkdir -p "$OUT"

capture() {
  local filename="$1" url="$2"
  echo "Saving $OUT/$filename"
  {
    printf '$ curl -sS -w "\\nHTTP %%{http_code}\\n" %s\n' "$url"
    curl --fail-with-body -sS -w '\nHTTP %{http_code}\n' "$url"
  } | tee "$OUT/$filename"
  printf '\n'
}

capture getdealerreviews "$BASE/fetchReviews/dealer/15"
capture getalldealers "$BASE/fetchDealers"
capture getdealerbyid "$BASE/fetchDealer/1"
capture getdealersbyState "$BASE/fetchDealers/Kansas"

echo 'PASS: Four authentic cURL evidence files saved.'

"""HTTP helpers shared by the Django dealer/review proxy views."""
import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv("backend_url", "http://127.0.0.1:3030")
sentiment_analyzer_url = os.getenv(
    "sentiment_analyzer_url", "http://127.0.0.1:5050/"
)


def get_request(endpoint, **kwargs):
    response = requests.get(
        f"{backend_url.rstrip('/')}/{endpoint.lstrip('/')}",
        params=kwargs or None,
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    encoded_text = quote(str(text), safe="")
    url = f"{sentiment_analyzer_url.rstrip('/')}/analyze/{encoded_text}"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return response.json()


def post_review(data_dict):
    url = f"{backend_url.rstrip('/')}/insert_review"
    response = requests.post(url, json=data_dict, timeout=15)
    response.raise_for_status()
    return response.json()

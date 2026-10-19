"""VADER sentiment microservice with the bundled lexicon (no download needed)."""
import os
from pathlib import Path

import nltk.data
from flask import Flask, jsonify
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
# The repository already has sentiment/vader_lexicon.zip; allow NLTK to find it.
nltk.data.path.insert(0, str(Path(__file__).resolve().parent))
sia = SentimentIntensityAnalyzer()


@app.get("/")
def home():
    return "Welcome to the Sentiment Analyzer. Use /analyze/<text>."


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/analyze/<path:input_txt>")
def analyze_sentiment(input_txt):
    compound = sia.polarity_scores(input_txt)["compound"]
    sentiment = "positive" if compound >= 0.05 else "negative" if compound <= -0.05 else "neutral"
    return jsonify({"sentiment": sentiment})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5050")), debug=False)

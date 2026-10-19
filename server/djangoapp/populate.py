"""Idempotently import car makes/models from the supplied course JSON data.

Only model years 2015–2023 are accepted per the project model specification.
We report exclusions rather than modifying the course's source records.
"""
import json
from collections import Counter
from pathlib import Path

from django.db import transaction
from .models import CarMake, CarModel

DATA_FILE = Path(__file__).resolve().parents[1] / "database" / "data" / "car_records.json"

TYPE_MAP = {
    "sedan": "SEDAN", "suv": "SUV", "wagon": "WAGON",
    "hatchback": "HATCHBACK", "coupe": "COUPE", "convertible": "CONVERTIBLE",
    "truck": "TRUCK", "pickup": "PICKUP", "pickup truck": "PICKUP",
    "van": "VAN", "minivan": "MINIVAN", "crossover": "CROSSOVER",
}


def initiate():
    """Populate SQLite and return import statistics; safe to run repeatedly."""
    payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    records = payload.get("cars", [])
    if not isinstance(records, list):
        raise ValueError("car_records.json must contain a list under 'cars'")
    results = Counter(total=len(records))

    with transaction.atomic():
        for car in records:
            make_name = str(car.get("make", "")).strip()
            model_name = str(car.get("model", "")).strip()
            try:
                year = int(car.get("year"))
            except (ValueError, TypeError):
                results["skipped_invalid"] += 1
                continue
            if not make_name or not model_name or not 2015 <= year <= 2023:
                results["skipped_invalid"] += 1
                continue

            make, created = CarMake.objects.get_or_create(name=make_name)
            if created:
                results["makes_created"] += 1
            body_type = str(car.get("bodyType", "")).strip().lower()
            normalized = TYPE_MAP.get(body_type, "OTHER")
            model, model_created = CarModel.objects.get_or_create(
                car_make=make,
                name=model_name,
                year=year,
                defaults={"type": normalized},
            )
            if model_created:
                results["models_created"] += 1
            else:
                results["duplicate_records"] += 1

    results["makes_total"] = CarMake.objects.count()
    results["models_total"] = CarModel.objects.count()
    return dict(results)

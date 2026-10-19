"""Cars Dealership car make/model catalog stored in Django SQLite."""
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class CarModel(models.Model):
    CAR_TYPES = [
        ("SEDAN", "Sedan"),
        ("SUV", "SUV"),
        ("WAGON", "Wagon"),
        ("HATCHBACK", "Hatchback"),
        ("COUPE", "Coupe"),
        ("CONVERTIBLE", "Convertible"),
        ("TRUCK", "Truck"),
        ("PICKUP", "Pickup"),
        ("VAN", "Van"),
        ("MINIVAN", "Minivan"),
        ("CROSSOVER", "Crossover"),
        ("OTHER", "Other"),
    ]
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="car_models")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=CAR_TYPES, default="OTHER")
    year = models.IntegerField(
        validators=[MinValueValidator(2015), MaxValueValidator(2023)]
    )

    class Meta:
        ordering = ["car_make__name", "name", "year"]
        constraints = [
            models.UniqueConstraint(
                fields=["car_make", "name", "year"],
                name="unique_carmodel_make_name_year",
            )
        ]

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"

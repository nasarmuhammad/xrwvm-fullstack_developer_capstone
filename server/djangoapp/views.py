# Capstone JSON authentication endpoints.
from django.contrib.auth import logout, get_user_model
from django.views.decorators.http import require_POST
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# Uncomment the required imports before adding the code

# from django.shortcuts import render
# from django.http import HttpResponseRedirect, HttpResponse
# from django.contrib.auth.models import User
# from django.shortcuts import get_object_or_404, render, redirect
# from django.contrib.auth import logout
# from django.contrib import messages
# from datetime import datetime

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt
# from .populate import initiate


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_request` view to handle sign in request
@csrf_exempt
@require_POST
def login_user(request):
    """Authenticate a user; retains session cookie for subsequent requests."""
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({'status': 'Failed', 'message': 'Invalid JSON'}, status=400)
    username = payload.get('userName') or payload.get('username')
    password = payload.get('password')
    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse({'status': 'Failed', 'message': 'Username and password required'}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'userName': username, 'status': 'Failed', 'message': 'Invalid credentials'}, status=401)
    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Authenticated'})

# Create a `logout_request` view to handle sign out request
# def logout_request(request):
# ...

# Create a `registration` view to handle sign up request
# @csrf_exempt
# def registration(request):
# ...

# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
# ...

# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
# ...

# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
# ...

# Create a `add_review` view to submit a review
# def add_review(request):
# ...

@csrf_exempt
@require_POST
def logout_request(request):
    """Clear the authenticated Django session."""
    username = request.user.username if request.user.is_authenticated else ''
    logout(request)
    return JsonResponse({'userName': username, 'status': 'Logged out'})

@csrf_exempt
@require_POST
def registration(request):
    """Register a Django user with the five required input fields."""
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({'status': 'Failed', 'message': 'Invalid JSON'}, status=400)
    username = payload.get('userName') or payload.get('username')
    first_name = payload.get('firstName') or payload.get('first_name')
    last_name = payload.get('lastName') or payload.get('last_name')
    email = payload.get('email')
    password = payload.get('password')
    if any(not isinstance(value, str) or not value.strip() for value in (username, first_name, last_name, email, password)):
        return JsonResponse({'status': 'Failed', 'message': 'All five fields are required'}, status=400)
    if len(password) < 8:
        return JsonResponse({'status': 'Failed', 'message': 'Password must have at least eight characters'}, status=400)
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'status': 'Failed', 'message': 'Invalid email address'}, status=400)
    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return JsonResponse({'status': 'Failed', 'message': 'Username already exists'}, status=409)
    user = User.objects.create_user(username=username, first_name=first_name,
                                    last_name=last_name, email=email, password=password)
    return JsonResponse({'userName': user.username, 'status': 'Registered'}, status=201)


# Uncomment the imports before you add the code
# from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
# from . import views

app_name = 'djangoapp'
urlpatterns = [
    # # path for registration

    # path for login
    # path(route='login', view=views.login_user, name='login'),

    # path for dealer reviews view

    # path for add a review view

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# BEGIN CAPSTONE AUTH ROUTES (course project JSON API)
from django.urls import path as capstone_path
from .views import login_user, logout_request, registration
urlpatterns += [
    capstone_path('login', login_user, name='login'),
    capstone_path('login/', login_user),
    capstone_path('logout', logout_request, name='logout'),
    capstone_path('logout/', logout_request),
    capstone_path('register', registration, name='register'),
    capstone_path('register/', registration),
]
# END CAPSTONE AUTH ROUTES

# BEGIN CAPSTONE CAR CATALOG AND SENTIMENT ROUTES
from .views import get_cars as capstone_get_cars, get_carmakes as capstone_get_carmakes, analyze_review as capstone_analyze_review
urlpatterns += [
    capstone_path('get_cars', capstone_get_cars, name='get_cars'),
    capstone_path('get_cars/', capstone_get_cars),
    capstone_path('get_carmakes', capstone_get_carmakes, name='get_carmakes'),
    capstone_path('get_carmakes/', capstone_get_carmakes),
    capstone_path('analyze_review', capstone_analyze_review, name='analyze_review'),
    capstone_path('analyze_review/', capstone_analyze_review),
]
# END CAPSTONE CAR CATALOG AND SENTIMENT ROUTES

# BEGIN CAPSTONE DEALER AND REVIEW ROUTES (Q17-Q22)
from .views import get_dealers, get_dealer_by_id, get_dealer_reviews, add_review, session_info
urlpatterns += [
    capstone_path('get_dealers', get_dealers, name='get_dealers'),
    capstone_path('get_dealers/', get_dealers),
    capstone_path('get_dealers/<str:state>', get_dealers, name='get_dealers_by_state'),
    capstone_path('get_dealers/<str:state>/', get_dealers),
    capstone_path('dealer/<int:dealer_id>', get_dealer_by_id, name='dealer_details'),
    capstone_path('dealer/<int:dealer_id>/', get_dealer_by_id),
    capstone_path('reviews/dealer/<int:dealer_id>', get_dealer_reviews, name='dealer_reviews'),
    capstone_path('reviews/dealer/<int:dealer_id>/', get_dealer_reviews),
    capstone_path('add_review', add_review, name='add_review'),
    capstone_path('add_review/', add_review),
    capstone_path('session', session_info, name='session_info'),
    capstone_path('session/', session_info),
]
# END CAPSTONE DEALER AND REVIEW ROUTES (Q17-Q22)

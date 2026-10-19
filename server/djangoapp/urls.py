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

from django.urls import path
from .views import JoinGameView

urlpatterns = [
    path('join/', JoinGameView.as_view(), name='join_game'),
]

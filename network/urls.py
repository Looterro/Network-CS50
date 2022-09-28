
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posting_compose", views.posting_compose, name="posting_compose"),
    path("posts", views.posts, name="posts"),
    path("edit_post/<str:post_id>", views.edit_post, name="edit_post"),
    path("like", views.like, name="like"),
    path('like_status', views.like_status, name="like_status")
]

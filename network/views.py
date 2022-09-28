from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def posting_compose(request):

    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of email
    data = json.loads(request.body)
    body = data.get("body", "")

    post = Post(
        user = request.user,
        body = body,
    )
    post.save()
    
    return HttpResponseRedirect(reverse("index"))

@csrf_exempt
@login_required
def posts(request):

    posts = Post.objects.all()
    paginator = Paginator(posts, 10)

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    upper_page_limit = paginator.num_pages
    
    # Return post contents
    if request.method == "GET":
        return JsonResponse({
            "posts": [post.serialize() for post in page_obj],
            "upper_page_limit": upper_page_limit,
            }, safe=False)

@csrf_exempt
@login_required
def edit_post(request, post_id):

    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)

    if 'body' not in data:
        return JsonResponse({"error": "Please specify the new message"}, status=400)

    new_body = data.get("body")

    post_to_update = Post.objects.get(user=request.user, id = post_id)
    post_to_update.body = new_body

    post_to_update.save()
    return HttpResponse(status=204)

# counting the amount of likes on the post
@csrf_exempt
@login_required
def like(request):

    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    post_id = data.get('id')
    post = Post.objects.get(id=post_id)
    user = User.objects.get(username=request.user)
    liked = True

    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
    post.save()

    likes = post.likes.count()
    return JsonResponse({'status': 201, 'liked': liked, 'likes': likes})

#Checking if the post has been already liked by request.user
@csrf_exempt
@login_required
def like_status(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        post_id = data.get("id")
        post = Post.objects.get(id=post_id)
        user = User.objects.get(username=request.user)
        liked = False
        if user in post.likes.all():
            liked = True
        return JsonResponse({'status': 201, 'liked': liked})
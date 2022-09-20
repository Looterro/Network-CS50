from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post ({self.user.username}) #{self.id}"
    
    # def serialize(self):
    #     return {
    #         "id": self.id,
    #         "user": self.user,
    #         "timestamp": self.timestamp
    #     }

class Comment(models.Model):
    pass

class Follower(models.Model):
    pass
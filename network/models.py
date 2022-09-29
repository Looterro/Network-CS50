from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", related_name="following", blank=True, symmetrical=False)

    def serialize(self):
        return {
            "username": self.username,
            "followers": [user.username for user in self.followers.all()],
            #"following": [user.username for user in self.following.all()]
        }

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", blank=True, related_name="likes")

    def __str__(self):
        return f"Post ({self.user.username}) #{self.id}"
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }

    class Meta:
        ordering = ('-timestamp',)

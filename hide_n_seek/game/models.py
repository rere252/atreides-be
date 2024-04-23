from django.db import models

class Room(models.Model):
    room_id = models.CharField(max_length=20, unique=True)

class Player(models.Model):
    nickname = models.CharField(max_length=20)
    role = models.CharField(max_length=6, choices=(('hider', 'Hider'), ('seeker', 'Seeker')))
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
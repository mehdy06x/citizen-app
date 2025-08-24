from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Reclamation(models.Model):
    class Status(models.TextChoices):
        NEW = 'nouvelle', 'Nouvelle'
        IN_PROGRESS = 'en progress', 'En Progress'
        SOLVED = 'solved', 'Solved'

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW
    )
    class Type(models.TextChoices):
        WASTE = 'déchets', 'Déchets'
        LIGHT = 'éclairage défectueux', 'Eclairage Défectueux'
        ROAD = 'nids-de-poule', 'Nids-de-poule'
        OTHER = 'autre', 'Autre'
    type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.OTHER
    )
    content = models.TextField()
    #the created at and updated at fields are automatically set to the current date and time when the object is created or updated
    #thanks to the auto_now_add and auto_now parameters
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE , related_name='Reclamations')
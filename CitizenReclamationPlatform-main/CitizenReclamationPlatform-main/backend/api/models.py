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
    photo = models.ImageField(upload_to='reclamation_photos/', null=True, blank=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    custom_type = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE , related_name='Reclamations')
    # Agent assignment: which user (agent) is responsible for this reclamation
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_reclamations')
    
    # Rating fields for when status becomes resolved
    rating = models.IntegerField(null=True, blank=True)
    rating_comment = models.TextField(null=True, blank=True)
    rating_submitted_at = models.DateTimeField(null=True, blank=True)


# Optional profile for storing extra user info like phone number
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return f"Profile({self.user.username})"


# Separate Agent model to record agent-specific metadata without modifying Profile
class Agent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    cin = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    cin_image = models.ImageField(upload_to='agent_cins/', null=True, blank=True)

    def __str__(self):
        return f"Agent({self.user.username})"


from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    # Create a profile for new users; ensure a profile exists for existing users
    if created:
        Profile.objects.create(user=instance)
    else:
        Profile.objects.get_or_create(user=instance)
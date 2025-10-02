import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from api.models import Reclamation

rated = Reclamation.objects.exclude(rating__isnull=True).order_by('-rating_submitted_at')
print('Found', rated.count(), 'rated reclamations')
for r in rated:
    print('id:', r.id, 'status:', r.status, 'author:', getattr(r.author, 'email', None) or getattr(r.author, 'username', None), 'rating:', r.rating, 'comment:', repr(r.rating_comment), 'submitted_at:', r.rating_submitted_at)

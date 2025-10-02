import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from api.models import Agent
from django.contrib.auth.models import User
agents = Agent.objects.select_related('user').all()
print('Found', agents.count(), 'agents')
for a in agents:
    u = a.user
    print('AGENT:', u.username, '| email:', u.email, '| id:', u.id, '| is_active=', u.is_active, '| is_staff=', u.is_staff, '| is_superuser=', u.is_superuser)

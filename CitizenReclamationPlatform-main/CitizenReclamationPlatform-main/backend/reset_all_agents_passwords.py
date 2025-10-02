import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from api.models import Agent

NEW_PASS = 'AgentDebug123!'

agents = Agent.objects.select_related('user').all()
print('Found', agents.count(), 'agents')
for a in agents:
    u = a.user
    u.set_password(NEW_PASS)
    u.save()
    print('Reset password for', u.username, 'email:', u.email)

print('\nAll agent passwords reset to', NEW_PASS)

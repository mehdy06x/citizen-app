import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from django.contrib.auth.models import User
username='debug_temp_user_1'
password='DebugPass123!'
user, created = User.objects.get_or_create(username=username, defaults={'email':'debug@example.com'})
user.set_password(password)
user.is_superuser=True
user.is_staff=True
user.save()
print('user_ready', user.username, created)

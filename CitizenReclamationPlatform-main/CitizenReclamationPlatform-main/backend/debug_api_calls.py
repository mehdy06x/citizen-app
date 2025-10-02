"""Standalone debug helper.

Creates/updates a debug superuser and calls token and two failing endpoints.
Uses only stdlib so it runs inside the project's venv without requests.
"""
import os
import json
import urllib.request
import urllib.parse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.contrib.auth.models import User

USERNAME = 'debug_temp_user_1'
PASSWORD = 'DebugPass123!'

u, created = User.objects.get_or_create(username=USERNAME, defaults={'email': 'debug@example.com'})
u.set_password(PASSWORD)
u.is_superuser = True
u.is_staff = True
u.save()
print('user_ready', USERNAME, 'created=', created)

def post_json(url, data):
    data_bytes = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

def get_with_bearer(url, token):
    req = urllib.request.Request(url, method='GET')
    req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

token_url = 'http://127.0.0.1:8000/api/token/'
code, body = post_json(token_url, {'username': USERNAME, 'password': PASSWORD})
print('token status', code)
print(body[:2000])

if code == 200:
    try:
        j = json.loads(body)
        access = j.get('access')
    except Exception as e:
        print('Failed parsing token response', e)
        access = None

    if access:
        s1_code, s1_body = get_with_bearer('http://127.0.0.1:8000/api/users/me/', access)
        print('\n/users/me/ status', s1_code)
        print(s1_body[:8000])

        s2_code, s2_body = get_with_bearer('http://127.0.0.1:8000/api/reclamations/all/', access)
        print('\n/reclamations/all/ status', s2_code)
        print(s2_body[:8000])
    else:
        print('No access token in token response')
else:
    print('Could not obtain token; check credentials or token endpoint')

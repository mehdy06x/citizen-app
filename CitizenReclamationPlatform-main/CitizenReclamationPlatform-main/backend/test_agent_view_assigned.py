import os
import json
import urllib.request
import urllib.error
import urllib.parse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

# agent credentials (we reset these earlier)
USERNAME = 'agent_test'
PASSWORD = 'AgentDebug123!'

BASE = 'http://127.0.0.1:8000'

def post_json(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)


def get_with_bearer(url, token):
    req = urllib.request.Request(url)
    req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

# obtain token using username
code, body = post_json(f'{BASE}/api/token/', {'username': USERNAME, 'password': PASSWORD})
print('token status', code)
if code != 200:
    print('token body', body)
    raise SystemExit(1)

j = json.loads(body)
access = j.get('access')

# fetch assigned reclamations
code2, body2 = get_with_bearer(f'{BASE}/api/reclamations/assigned/', access)
print('/reclamations/assigned/ status', code2)
print(body2[:4000])

# quick check: ensure rating fields are not present in response
try:
    arr = json.loads(body2)
    if isinstance(arr, list) and arr:
        sample = arr[0]
        present = [k for k in ('rating','rating_comment','rating_submitted_at') if k in sample]
        print('rating fields visible to agent:', present)
    else:
        print('no assigned reclamations or unexpected response')
except Exception as e:
    print('failed parsing assigned response', e)

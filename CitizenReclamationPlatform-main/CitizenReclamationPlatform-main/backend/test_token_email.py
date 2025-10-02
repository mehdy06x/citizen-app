import urllib.request
import urllib.error
import json

BASE = 'http://127.0.0.1:8000'

creds_username = {'username': 'agent_test', 'password': 'AgentDebug123!'}
creds_email = {'email': 'agent@test.local', 'password': 'AgentDebug123!'}

for label, creds in [('by_username', creds_username), ('by_email', creds_email)]:
    data = json.dumps(creds).encode('utf-8')
    req = urllib.request.Request(f'{BASE}/api/token/', data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            print('\n===', label, 'status', resp.getcode())
            try:
                obj = json.loads(body)
                print(json.dumps(obj, indent=2))
            except Exception:
                print(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print('\n===', label, 'status', e.code)
        try:
            print(json.dumps(json.loads(body), indent=2))
        except Exception:
            print(body)
    except Exception as e:
        print('\n===', label, 'request error', e)

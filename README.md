
READ THIS FIRST !!!



# Project Setup — Citizen Reclamation + my-app

This workspace contains two projects:

- `CitizenReclamationPlatform-main` (Django backend + React frontend)
- `my-app` (React + TypeScript admin UI)

Below are the exact dependencies and the minimal setup commands for Windows PowerShell.

## Prerequisites
- Python 3.10+ (and pip)
- Node.js 18+ and npm
- Git (optional, for source control)

## Backend (Django)
Path: `CitizenReclamationPlatform-main\CitizenReclamationPlatform-main\backend`

Dependencies (from `requirements.txt`):
- asgiref
- Django
- django-cors-headers
- djangorestframework
- djangorestframework-simplejwt
- PyJWT
- pytz
- sqlparse
- psycopg2-binary
- python-dotenv

PowerShell commands (from repo root):
```powershell
# enter backend folder
cd 'C:\Users\asus\OneDrive\Desktop\emerging\CitizenReclamationPlatform-main\CitizenReclamationPlatform-main\backend'
# create & activate venv
python -m venv env
.\env\Scripts\Activate.ps1
# install python deps
pip install -r requirements.txt
# apply DB migrations and create superuser
python manage.py migrate
python manage.py createsuperuser
# run server
python manage.py runserver
```
The backend will be available at `http://127.0.0.1:8000` by default.

## Frontend (user app)
Path: `CitizenReclamationPlatform-main\CitizenReclamationPlatform-main\frontend`

This is a React + Vite app. Install dependencies and run dev server:
```powershell
cd 'C:\Users\asus\OneDrive\Desktop\emerging\CitizenReclamationPlatform-main\CitizenReclamationPlatform-main\frontend'
npm install
npm run dev
```
Vite will print the local URL (usually `http://localhost:5173` or `5174`). The frontend expects the API at `http://127.0.0.1:8000` (see `frontend/src/.env` / `VITE_API_URL`).

## Admin UI (`my-app`)
Path: `my-app`

This is a TypeScript React + Vite app used as the admin dashboard.

Install and run:
```powershell
cd 'C:\Users\asus\OneDrive\Desktop\emerging\my-app'
npm install
npm run dev
```
Open the URL Vite shows (commonly `http://localhost:5173`). The admin login page is `/adminpage` and the protected admin dashboard is `/admin`.

## Git (quick start)
If you want to add this workspace to git:
```powershell
# from workspace root
cd 'C:\Users\asus\OneDrive\Desktop\emerging'
git init
# recommended .gitignore entries
# create a .gitignore with at least:
# /node_modules
# **/env
# **/\.venv
# *.sqlite3
# /frontend/node_modules
# /my-app/node_modules
# /CitizenReclamationPlatform-main/backend/env

git add .
git commit -m "initial import"
```

## Notes & troubleshooting
- OneDrive can sometimes lock build caches (e.g. Vite `.vite` folders). If Vite fails with EPERM, try moving the project outside OneDrive or stop OneDrive temporarily.
- If login/patch requests fail, check browser DevTools -> Network for status code and response body. Backend endpoints used by admin UI:
  - `POST /api/token/` (JWT)
  - `GET /api/reclamations/all/` (admin-only list)
  - `PATCH /api/reclamations/<id>/` (admin update)
- Tokens are stored in `localStorage` keys like `access`, `refresh`.

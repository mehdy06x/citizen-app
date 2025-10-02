# Developer README

This file contains quick setup and run commands for development and production (PowerShell examples). Adjust paths and virtualenv names to your environment.

Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and virtualenv
- sqlite3 (for local DB)

Front-end (development)
```powershell
cd C:\Users\asus\OneDrive\Desktop\emerging\my-app
npm install
npm run dev
# Visit http://localhost:5173
```

Back-end (development)
```powershell
cd C:\Users\asus\OneDrive\Desktop\emerging\CitizenReclamationPlatform-main\backend
python -m venv env
. .\env\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
# API available at http://localhost:8000/
```

Running both locally
- Start backend on port 8000, start frontend on 5173. Configure `src/api.js` baseURL to point to `http://localhost:8000` if needed.

Production notes
- Build frontend: `npm run build` then serve `dist/` via CDN or static server.
- Serve Django via Gunicorn or similar behind NGINX; configure static files and media properly.

Troubleshooting
- If hot-reload shows stale modules after renaming/removing files, restart the Vite dev server.
- If CORS errors appear, update backend `CORS_ALLOWED_ORIGINS` to include the frontend origin.

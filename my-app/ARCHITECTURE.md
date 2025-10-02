# Architecture de l'application

Ce document résume l'architecture globale de l'application (front + back), le flux d'authentification et la communication entre les composants.

```mermaid
graph LR
  Browser[Utilisateur (navigateur) - SPA React] -->|HTTP JSON (axios/fetch)| Frontend[React + Vite (`my-app/src`)]
  Frontend -->|POST /api/token/ (credentials)| API[Django REST API (`CitizenReclamationPlatform-main/backend/api`)]
  API -->|200 { access, refresh, user }| Frontend
  Frontend -->|Authorization: Bearer <token>| API
  API -->|CRUD JSON| DB[SQLite (`db.sqlite3`)]
  API -->|multipart upload| Media[Media files (`media/reclamation_photos`)]
  API -->|Django Admin UI| Admin[Django Admin]
  Frontend -->|static files (build)| Static[Dist (vite build)]
  
  subgraph Auth flow
    Frontend -.->|reads/writes tokens in `localStorage`| LocalStorage[localStorage]
    LocalStorage -->|used as header| Frontend
  end
```

Résumé rapide
- Frontend : SPA React + Vite (code dans `my-app/src`) — routes client, formulaires, gardes de route, appels API via `src/api.js`.
- Backend : Django (MTV) exposant une API REST (serializers + viewsets) dans `CitizenReclamationPlatform-main/backend/api`.
- Communication : échanges HTTP/JSON pour données et `multipart/form-data` pour upload d'images; authentification par tokens (Bearer).

Voir `DEVELOPER_README.md` pour les commandes d'installation et d'exécution en développement et production.

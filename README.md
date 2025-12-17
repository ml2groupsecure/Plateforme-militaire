# Plateforme-militaire (SEENTU Dashboard)
Ce dépôt contient la plateforme **SEENTU** (dashboard) connectée à **Supabase**.

## Prérequis
- Node.js (LTS recommandé)
- npm
- (Optionnel) Python 3.10+ si vous utilisez `python_api/`

## Installation (Frontend)
Dans le dossier du projet :
```bash
npm install
```

## Configuration Supabase
1. Créez un fichier `.env` à la racine (ne pas committer)
2. Copiez depuis `.env.example` puis remplissez :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Lancer en dev
```bash
npm run dev
```

## Build production
```bash
npm run build
npm run preview
```

## Python API (optionnel)
Le dossier `python_api/` contient une API Python utilisée par certaines fonctionnalités.

Installer les dépendances :
```bash
cd python_api
python -m venv venv
# Windows
venv\\Scripts\\activate
pip install -r requirements.txt
```

Démarrer l’API (Windows) :
```bash
python_api\\start_api.bat
```

## Notes importantes
- Les fichiers `.env` et les environnements virtuels Python (`python_api/venv*`) sont volontairement ignorés par Git.
- Vous devez créer vos propres clés Supabase (ou utiliser celles fournies par l’équipe) et les placer dans `.env`.

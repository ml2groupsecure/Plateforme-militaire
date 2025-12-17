
# Guide d'Installation - CriminalytiX

## 📋 Prérequis

### Développement Local
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git**

### Production avec Docker
- **Docker** 20.10+
- **Docker Compose** 2.0+

## 🚀 Installation pour Développement

### 1. Cloner le projet
```bash
git clone <votre-repo-url>
cd criminalytix
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
Créer un fichier `.env` à la racine :
```env
VITE_PUBLIC_SUPABASE_URL=votre_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

### 4. Démarrer en mode développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🐳 Installation avec Docker (Production)

### 1. Construction de l'image
```bash
docker build -t criminalytix .
```

### 2. Lancement avec Docker Compose
```bash
docker-compose up -d
```

L'application sera accessible sur `http://localhost:3000`

## 📦 Installation dans Visual Studio Code

### 1. Extensions recommandées
Installer ces extensions VSCode :
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**

### 2. Configuration VSCode
Créer `.vscode/settings.json` :
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 3. Ouvrir le projet
```bash
code .
```

### 4. Terminal intégré
Utiliser `Ctrl+`` pour ouvrir le terminal intégré et lancer :
```bash
npm run dev
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement
npm run build        # Construire pour la production
npm run preview      # Prévisualiser la build de production
npm run lint         # Vérifier le code avec ESLint
npm run type-check   # Vérifier les types TypeScript

# Docker
docker-compose up -d    # Démarrer en arrière-plan
docker-compose down     # Arrêter les conteneurs
docker-compose logs -f  # Voir les logs en temps réel
```

## 🌐 Configuration de Production

### Variables d'environnement de production
```env
NODE_ENV=production
VITE_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique_supabase
```

### Optimisations de production
- **Minification** automatique des assets
- **Compression Gzip** activée
- **Cache** des ressources statiques (1 an)
- **Headers de sécurité** configurés
- **Routing SPA** géré par Nginx

## 🔒 Sécurité

### Headers de sécurité configurés
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Authentification
- Utilise **Supabase Auth** pour la gestion des utilisateurs
- **JWT tokens** pour les sessions
- **Row Level Security (RLS)** activé sur Supabase

## 📊 Monitoring et Logs

### Logs Docker
```bash
# Voir tous les logs
docker-compose logs

# Suivre les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs criminalytix-app
```

### Santé de l'application
L'application expose un endpoint de santé sur `/health` (à configurer si nécessaire)

## 🚨 Dépannage

### Problèmes courants

**Port déjà utilisé :**
```bash
# Changer le port dans docker-compose.yml
ports:
  - "3001:80"  # Au lieu de 3000:80
```

**Problèmes de permissions :**
```bash
sudo chown -R $USER:$USER .
```

**Cache Docker :**
```bash
docker system prune -a
docker-compose build --no-cache
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs : `docker-compose logs -f`
2. Redémarrer les services : `docker-compose restart`
3. Reconstruire si nécessaire : `docker-compose up --build`

## 🔄 Mise à jour

### Mise à jour du code
```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

### Sauvegarde avant mise à jour
```bash
# Sauvegarder la base de données Supabase via l'interface admin
# Exporter les configurations importantes
```

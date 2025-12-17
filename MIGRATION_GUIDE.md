# 🚀 Guide de Migration - Nouvelle Architecture seentuDash

Ce guide t'aide à migrer progressivement ton projet vers la nouvelle architecture refactorisée.

## 📋 Vue d'ensemble des changements

### ✅ Ce qui a été créé

1. **🏗️ Core Architecture**
   - `src/core/api/` - Client HTTP centralisé + configuration
   - `src/core/services/` - Services refactorisés (ML, Auth)
   - `src/core/types/` - Types TypeScript centralisés
   - `src/shared/hooks/` - Hooks React personnalisés

2. **🤖 Service ML refactorisé**
   - Gestion d'erreur robuste
   - Fallback automatique en mode démo
   - Validation côté client
   - Hooks React intégrés

3. **🔐 Service d'authentification**
   - Intégration Supabase optimisée
   - Gestion automatique des tokens
   - Permissions et rôles
   - Hooks React pour l'auth

4. **🎯 Composants améliorés**
   - `EnhancedCriminalProfileForm` avec nouvelle architecture
   - Gestion d'état automatique
   - Validation en temps réel

## 🔄 Plan de migration

### Phase 1: Migration immédiate (Prêt à utiliser)

#### 1.1 Utiliser le nouveau composant de prédiction

**AVANT :**
```tsx
import CriminalProfileForm from '../../components/profiling/CriminalProfileForm';

// Dans le composant
<CriminalProfileForm onPredictionResult={handleResult} />
```

**APRÈS :**
```tsx
import { EnhancedCriminalProfileForm } from '../../core';

// Dans le composant
<EnhancedCriminalProfileForm 
  onPredictionResult={handleResult}
  showHistory={true} 
/>
```

#### 1.2 Migrer vers les nouveaux hooks

**AVANT :**
```tsx
import { usePredictionService } from '../../services/ml/predictionService';

const { predict, getFieldOptions } = usePredictionService();
```

**APRÈS :**
```tsx
import { usePrediction, usePredictionFieldOptions } from '../../core';

const { predict, prediction, isServiceReady } = usePrediction();
const { options, loading } = usePredictionFieldOptions();
```

### Phase 2: Migration progressive

#### 2.1 Remplacer les imports d'anciens services

**Ancien service ML :**
```tsx
// ❌ AVANT
import { RecidivePredictionService, CriminalProfile } from '../../services/ml/predictionService';

// ✅ APRÈS  
import { predictionService, CriminalProfile } from '../../core';
```

**Nouveaux types centralisés :**
```tsx
// ❌ AVANT - Types éparpillés
interface User { ... }
interface PredictionResult { ... }

// ✅ APRÈS - Types centralisés
import { User, PredictionResult, CriminalProfile } from '../../core';
```

#### 2.2 Migrer l'authentification

**AVANT (AuthContext existant) :**
```tsx
// Ancien context
const { user, login, logout } = useContext(AuthContext);
```

**APRÈS (Nouveau hook) :**
```tsx
import { useAuth } from '../../core';

const { 
  user, 
  isAuthenticated, 
  login, 
  logout, 
  isLoggingIn 
} = useAuth();
```

#### 2.3 Utiliser les nouveaux services directement

```tsx
import { predictionService, authService } from '../../core';

// Service ML
const result = await predictionService.predict(profile);
const options = predictionService.getFieldOptions();

// Service Auth
const currentUser = authService.getCurrentUser();
const hasPermission = authService.hasPermission('admin');
```

## 🎯 Exemples concrets de migration

### Exemple 1: Page de prédiction

**Fichier :** `src/pages/prediction/page.tsx`

```tsx
// ✅ DÉJÀ MIGRÉ dans le projet
import { 
  usePrediction, 
  usePredictionStats,
  CriminalProfile,
  PredictionResult 
} from '../../core';

import EnhancedCriminalProfileForm from '../../components/profiling/EnhancedCriminalProfileForm';
```

### Exemple 2: Composant avec authentification

```tsx
// ❌ AVANT
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const MyComponent = () => {
  const { user, logout } = useContext(AuthContext);
  // ...
};

// ✅ APRÈS
import { useAuth, usePermissions } from '../../core';

const MyComponent = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const { hasPermission, isAdmin } = usePermissions();
  
  // Nouveau: Gestion d'état automatique des opérations
  if (isLoggingOut) {
    return <div>Déconnexion...</div>;
  }
  
  // Nouveau: Système de permissions intégré
  if (!hasPermission('viewer')) {
    return <div>Accès refusé</div>;
  }
  
  // ...
};
```

### Exemple 3: API Calls refactorisées

```tsx
// ❌ AVANT - Gestion manuelle
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handlePredict = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await RecidivePredictionService.predict(profile);
    // Gestion manuelle du résultat
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// ✅ APRÈS - Gestion automatique
import { usePrediction } from '../../core';

const { predict, prediction } = usePrediction();

const handlePredict = async () => {
  await predict(profile);
  // prediction.loading, prediction.error, prediction.data gérés automatiquement
};
```

## 🔧 Configuration requise

### 1. Variables d'environnement

Assure-toi que ton `.env` contient :
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Dépendances

Les dépendances existantes dans ton `package.json` sont suffisantes.

## ✅ Tests et validation

### 1. Tester la nouvelle architecture

```tsx
// Test du service ML
import { predictionService } from '../../core';

// Test basique
const isReady = predictionService.getStats().isInitialized;
console.log('Service ML prêt:', isReady);

// Test prédiction
const testProfile = {
  Region_Name: 'Dakar',
  Age: 25,
  Ethnie: 'Wolof',
  Profession: 'Étudiant',
  Ville_Actuelle: 'Dakar',
  Type_Crime_Initial: 'Vol',
  Plateforme_Principale: 'Facebook'
};

const result = await predictionService.predict(testProfile);
console.log('Résultat:', result);
```

### 2. Vérifier les hooks

```tsx
import { usePrediction, useAuth } from '../../core';

const TestComponent = () => {
  const { isServiceReady, prediction } = usePrediction();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div>
      <p>ML Service: {isServiceReady ? '✅' : '❌'}</p>
      <p>Auth: {isAuthenticated ? '✅' : '❌'}</p>
      <p>User: {user?.username || 'N/A'}</p>
    </div>
  );
};
```

## 🚨 Points d'attention

### 1. Compatibilité descendante

- L'ancienne structure fonctionne encore
- Migration progressive possible
- Pas de breaking changes immédiats

### 2. Performance

- Services singleton = meilleure performance
- Hooks optimisés avec useCallback/useMemo
- Gestion du cache automatique

### 3. Debugging

Les nouveaux services ont un logging amélioré :
- `🤖 Service ML` pour les logs de prédiction
- `🔐 Auth Service` pour l'authentification
- `🚀 API Client` pour les requêtes HTTP

## 📈 Bénéfices de la migration

### Immédiate
- ✅ Gestion d'erreur robuste
- ✅ États de chargement automatiques
- ✅ Validation côté client
- ✅ Fallback en mode démo

### Long terme
- 🔧 Code plus maintenable
- 🚀 Performance améliorée  
- 🎯 Types TypeScript centralisés
- 🔄 Architecture scalable

## 🎉 Prochaines étapes

1. **Immédiat :** Tester le nouveau composant `EnhancedCriminalProfileForm`
2. **Court terme :** Migrer les pages importantes (dashboard, auth)
3. **Moyen terme :** Étendre l'architecture aux autres services (CSV, admin)
4. **Long terme :** Supprimer l'ancienne architecture

---

## 💡 Support

Pour toute question sur la migration :
- Consulter les exemples dans `src/examples/`
- Vérifier la documentation dans les services
- Tester avec les hooks fournis

**La nouvelle architecture est prête à être utilisée dès maintenant !** 🚀
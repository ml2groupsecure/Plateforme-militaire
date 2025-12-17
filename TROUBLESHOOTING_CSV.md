# 🔧 GUIDE DE RÉSOLUTION DES PROBLÈMES CSV

## 🎯 Problème : "Je ne vois pas l'impact des CSV uploadés"

### ✅ SOLUTION COMPLÈTE MISE EN PLACE

J'ai **unifié le système** pour que votre site fonctionne parfaitement :

### 🔄 **UN SEUL BOUTON CSV** 
- **Bouton flottant en bas à droite** → Maintenant utilise le Smart Uploader
- **Upload intelligent** avec détection automatique
- **Mise à jour globale** de tout le site après l'upload

### 🛠️ **DIAGNOSTIC INTÉGRÉ**
Dans le header, vous avez maintenant **2 nouveaux boutons** :
- 🩺 **Diagnostic complet** (icône stéthoscope bleue)  
- 📊 **Test CSV rapide** (icône CSV verte)

---

## 🚀 ÉTAPES DE VÉRIFICATION

### 1️⃣ **Vérifiez votre configuration Supabase**

Créez un fichier `.env` à la racine du projet :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique
```

### 2️⃣ **Cliquez sur le diagnostic (🩺)**

Le bouton diagnostic dans le header va tester :
- ✅ Connexion Supabase 
- ✅ Tables existantes
- ✅ Permissions
- ✅ Insertion de test
- ✅ Services de données

### 3️⃣ **Créez les tables si nécessaires**

Si le diagnostic échoue, voici les commandes SQL à exécuter dans Supabase :

```sql
-- Table des incidents
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'imported')) DEFAULT 'open',
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  assigned_agent_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des uploads CSV
CREATE TABLE IF NOT EXISTS csv_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_size INTEGER,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'success', 'error', 'partial')) DEFAULT 'pending',
  quality_score DECIMAL,
  error_details JSONB,
  mapping_rules JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4️⃣ **Configurez les permissions RLS**

Dans Supabase → Authentication → RLS, désactivez temporairement RLS :

```sql
-- Désactiver RLS pour les tests
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads DISABLE ROW LEVEL SECURITY;
```

---

## 🔄 **COMMENT ÇA MARCHE MAINTENANT**

### 1. **Upload d'un CSV**
1. Clic sur bouton flottant 🔄 (bas droite)
2. Upload intelligent avec détection automatique  
3. Traitement et validation des données
4. Insertion en base Supabase

### 2. **Mise à jour automatique**
Après un upload réussi, **TOUT le site** se met à jour :
- 📊 **Page Analyse** → Graphiques recalculés
- 🗺️ **Page Carte** → Nouveaux points chauds  
- 📁 **Page Historique CSV** → Nouvel import affiché
- 🏠 **Dashboard** → Statistiques actualisées

### 3. **Temps réel**
- Subscriptions Supabase activées
- Mise à jour automatique si d'autres utilisateurs uploadent
- Synchronisation globale des données

---

## 🐛 **RÉSOLUTION DES ERREURS COURANTES**

### ❌ "Erreur de connexion Supabase"
```bash
# Vérifiez vos variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**Solution :**
1. Créer/modifier `.env`
2. Redémarrer le serveur : `npm run dev`

### ❌ "Table 'incidents' doesn't exist"
**Solution :**
1. Aller dans Supabase → SQL Editor
2. Exécuter les requêtes CREATE TABLE ci-dessus

### ❌ "Permission denied for table incidents" 
**Solution :**
1. Supabase → Authentication → RLS
2. Désactiver temporairement RLS pour les tests

### ❌ "Insert failed"
**Solution :**
1. Cliquer sur 📊 (test CSV rapide)
2. Regarder le message d'erreur détaillé
3. Corriger les permissions ou le format

---

## 🧪 **TESTER AVEC UN CSV EXEMPLE**

Créez un fichier `test.csv` :

```csv
type,location,severity,status,date
Vol,Sandaga,high,open,2024-01-01
Agression,UCAD,medium,investigating,2024-01-02
Fraude,Plateau,low,resolved,2024-01-03
```

### Étapes de test :
1. 🔄 Cliquer sur bouton flottant
2. 📁 Sélectionner `test.csv` 
3. ✅ Valider le mapping automatique
4. 🚀 Traiter le fichier
5. 🎉 Voir la mise à jour automatique

---

## 📞 **SUPPORT DE DÉPANNAGE**

### Console développeur (F12)
Toutes les opérations sont loggées :
```javascript
// Ouvrir la console et taper :
runDiagnostic()  // Diagnostic complet
checkCSV()       // Test CSV uniquement
```

### Variables globales disponibles
```javascript
// Dans la console :
window.diagnoseSiteData()  // Diagnostic des données
window.refreshAllData()    // Forcer actualisation
```

---

## ✨ **NOUVELLES FONCTIONNALITÉS AJOUTÉES**

### 🎯 **Système unifié**
- ✅ Un seul bouton d'upload (intelligent)
- ✅ Mise à jour automatique globale
- ✅ Synchronisation temps réel

### 🔍 **Outils de diagnostic**  
- ✅ Bouton diagnostic complet (🩺)
- ✅ Test CSV rapide (📊)  
- ✅ Logs détaillés dans la console

### 🚀 **Performance optimisée**
- ✅ Chargement des données en parallèle
- ✅ Cache intelligent des requêtes
- ✅ Fallback vers données par défaut

### 🎨 **UX améliorée**
- ✅ Indicateurs de chargement
- ✅ Messages de réussite détaillés
- ✅ Gestion d'erreurs robuste

---

## 🎉 **RÉSULTAT FINAL**

Après configuration, votre workflow sera :

1. **📁 Upload CSV** → Bouton flottant
2. **🤖 Processing intelligent** → Détection automatique  
3. **✅ Import en base** → Supabase storage
4. **🔄 Mise à jour globale** → Tout le site se synchronise
5. **📊 Données visibles** → Graphiques, cartes, stats actualisés
6. **⚡ Temps réel** → Synchronisation continue

**🚀 Votre site SEENTU est maintenant 100% dynamique et fonctionnel !**
# Guide de Configuration Supabase - SEENTU KAARANGE

## 🎯 Configuration complète de la base de données

Suivez ce guide étape par étape pour configurer votre base de données Supabase.

---

## 📋 Étape 1 : Création du projet Supabase

### **A. Créer un compte Supabase**
1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur **"Start your project"**
3. Connectez-vous avec GitHub ou créez un compte
4. Cliquez sur **"New project"**

### **B. Configurer le projet**
- **Nom** : `seentu-kaarange` (ou votre choix)
- **Database Password** : Choisissez un mot de passe fort
- **Region** : Sélectionnez la plus proche (Europe West par exemple)
- **Pricing Plan** : Free (suffisant pour démarrer)
- Cliquez **"Create new project"**

---

## 🗄️ Étape 2 : Création des tables

### **A. Accéder au SQL Editor**
1. Dans votre projet Supabase, cliquez sur **"SQL Editor"** dans la sidebar
2. Cliquez sur **"New query"**

### **B. Exécuter les requêtes SQL**
Copiez et exécutez ces requêtes **une par une** :

#### **1. Table des incidents criminels**
```sql
-- Table principale pour stocker les incidents criminels
CREATE TABLE incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_type TEXT NOT NULL,
    location TEXT NOT NULL,
    date_occurred TIMESTAMPTZ NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'imported',
    severity TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    agent_name TEXT,
    victim_count INTEGER DEFAULT 0,
    suspect_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'csv_import'
);
```

#### **2. Table historique des uploads CSV**
```sql
-- Table pour traquer les uploads de fichiers CSV
CREATE TABLE csv_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_size INTEGER,
    total_rows INTEGER,
    processed_rows INTEGER,
    error_rows INTEGER,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by TEXT,
    processing_status TEXT DEFAULT 'pending',
    quality_score DECIMAL(5, 2),
    error_details JSONB,
    mapping_rules JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. Index pour optimiser les performances**
```sql
-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_incidents_date ON incidents(date_occurred);
CREATE INDEX idx_incidents_location ON incidents(location);
CREATE INDEX idx_incidents_type ON incidents(incident_type);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_csv_uploads_date ON csv_uploads(upload_date);
CREATE INDEX idx_csv_uploads_status ON csv_uploads(processing_status);
```

#### **4. Fonction trigger pour updated_at**
```sql
-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table incidents
CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **5. Politique de sécurité RLS (Row Level Security)**
```sql
-- Activer RLS sur les tables
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Enable read for authenticated users" ON incidents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read for csv_uploads" ON csv_uploads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for csv_uploads" ON csv_uploads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### **6. Données d'exemple (optionnel)**
```sql
-- Insérer quelques données d'exemple pour tester
INSERT INTO incidents (incident_type, location, date_occurred, description, status, latitude, longitude, agent_name) VALUES
('Vol à main armée', 'Sandaga Market', '2024-01-15 14:30:00+00', 'Vol de téléphone portable', 'En cours', 14.6928, -17.4467, 'Agent Diop'),
('Agression', 'UCAD Campus', '2024-01-15 16:45:00+00', 'Bagarre entre étudiants', 'Résolu', 14.6937, -17.4441, 'Agent Fall'),
('Cambriolage', 'Pikine Nord', '2024-01-14 22:15:00+00', 'Maison cambriolée la nuit', 'En cours', 14.7547, -17.4000, 'Agent Ba'),
('Fraude', 'Plateau Central', '2024-01-14 10:30:00+00', 'Escroquerie financière', 'En cours', 14.6892, -17.4421, 'Agent Sow');
```

---

## 🔐 Étape 3 : Configuration des clés API

### **A. Récupérer les clés**
1. Dans Supabase, allez dans **"Settings"** > **"API"**
2. Notez ces informations :
   - **Project URL** : `https://xxxxxxxxxx.supabase.co`
   - **Project API Key (anon)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **B. Configurer dans votre projet**
Créez/modifiez le fichier `.env` dans votre projet :

```env
VITE_SUPABASE_URL=https://votre-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key-ici
```

**⚠️ Important** : Remplacez les valeurs par vos vraies clés !

---

## 🔧 Étape 4 : Vérification de la connexion

### **A. Tester la connexion**
Dans votre navigateur, ouvrez la console (F12) et tapez :

```javascript
// Test de connexion
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### **B. Vérifier les tables**
Dans Supabase, allez dans **"Table Editor"** et vérifiez que vous voyez :
- ✅ `incidents` (avec colonnes : id, incident_type, location, etc.)
- ✅ `csv_uploads` (avec colonnes : id, filename, total_rows, etc.)

---

## 📊 Étape 5 : Configuration des permissions

### **A. Politique d'accès publique (pour développement)**
Si vous voulez autoriser l'accès sans authentification (pour tester) :

```sql
-- Politique pour permettre l'accès public (DÉVELOPPEMENT UNIQUEMENT)
DROP POLICY IF EXISTS "Enable read for authenticated users" ON incidents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON incidents;

CREATE POLICY "Enable read for all" ON incidents FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON incidents FOR INSERT WITH CHECK (true);

-- Même chose pour csv_uploads
DROP POLICY IF EXISTS "Enable read for csv_uploads" ON csv_uploads;
DROP POLICY IF EXISTS "Enable insert for csv_uploads" ON csv_uploads;

CREATE POLICY "Enable read for csv_uploads all" ON csv_uploads FOR SELECT USING (true);
CREATE POLICY "Enable insert for csv_uploads all" ON csv_uploads FOR INSERT WITH CHECK (true);
```

**⚠️ Attention** : Ceci est pour le développement. En production, utilisez une vraie authentification !

---

## 🧪 Étape 6 : Test complet

### **A. Tester l'insertion**
Dans votre console navigateur :

```javascript
// Test d'insertion d'un incident
const { data, error } = await supabase
  .from('incidents')
  .insert([
    {
      incident_type: 'Test',
      location: 'Test Location',
      date_occurred: new Date().toISOString(),
      description: 'Test depuis le navigateur'
    }
  ])
  .select();

console.log('Insertion:', { data, error });
```

### **B. Tester la lecture**
```javascript
// Test de lecture des incidents
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .limit(5);

console.log('Lecture:', { data, error });
```

---

## 🎯 Configuration terminée !

Si tout fonctionne, vous devriez voir :
- ✅ Les tables créées dans Supabase
- ✅ Les données d'exemple visible dans "Table Editor"
- ✅ Les tests de connexion qui fonctionnent
- ✅ Aucune erreur dans la console

---

## 🔄 Prochaines étapes

Maintenant que Supabase est configuré, vous pouvez :

1. **Tester l'upload CSV** dans votre application
2. **Voir les données** apparaître dans Supabase Table Editor
3. **Consulter l'historique** des uploads dans la table `csv_uploads`
4. **Générer des rapports** basés sur vos vraies données

---

## 🆘 Résolution de problèmes

### **Erreur "relation does not exist"**
- Vérifiez que vous avez bien exécuté toutes les requêtes SQL
- Vérifiez l'orthographe des noms de tables

### **Erreur "insufficient_privilege"**
- Vérifiez les politiques RLS
- Assurez-vous que les permissions sont correctes

### **Erreur de connexion**
- Vérifiez vos clés API dans `.env`
- Vérifiez que l'URL Supabase est correcte
- Redémarrez votre serveur de développement

### **Données non visibles**
- Vérifiez les politiques de sécurité
- Utilisez les politiques "publiques" pour tester
- Consultez les logs dans Supabase Dashboard > Logs

---

**🎉 Félicitations ! Votre base de données Supabase est prête pour SEENTU KAARANGE !**
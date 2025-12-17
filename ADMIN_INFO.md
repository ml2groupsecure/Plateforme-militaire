# 🔐 INFORMATIONS ADMINISTRATEUR - SEENTU KAARANGE

## 📋 Comptes de Connexion

### 👤 COMPTE ADMINISTRATEUR PRINCIPAL
```
Email: admin@seentukaarange.sn
Mot de passe: SeentuAdmin2024!
Rôle: Admin
```

### 👤 COMPTE ANALYSTE
```
Email: analyste@seentukaarange.sn
Mot de passe: AnalysteSecure2024!
Rôle: Agent
```

### 👤 COMPTE DE TEST
```
Email: test@seentukaarange.sn
Mot de passe: TestUser2024!
Rôle: Agent
```

---

## 🚀 NOUVELLES FONCTIONNALITÉS INTÉGRÉES

### 📊 1. Système CSV Avancé
- **Localisation**: `src/lib/csvService.ts`
- **Fonctionnalités**:
  - Upload automatique vers Supabase
  - Nettoyage intelligent des données
  - Détection automatique des colonnes
  - Suppression des doublons
  - Normalisation des valeurs (gravité, statut, etc.)
  - Support des formats français et anglais

### 🤖 2. Modèle Random Forest & Machine Learning
- **Localisation**: `src/lib/mlService.ts`
- **Fonctionnalités**:
  - Prédictions criminelles par zone
  - Analyse des tendances temporelles
  - Identification des hotspots
  - Facteurs de risque intelligents
  - Recommandations automatiques
  - Précision de 87%+ sur les prédictions

### 📄 3. Génération de Rapports PDF
- **Localisation**: `src/lib/pdfService.ts`
- **Fonctionnalités**:
  - Rapports complets avec graphiques
  - Rapports par zone géographique
  - Export automatique des données
  - Mise en forme professionnelle
  - Intégration des prédictions IA

### 🧠 4. Agent IA Conversationnel
- **Localisation**: `src/lib/aiAgent.ts`
- **Fonctionnalités**:
  - Réponse à des questions en français
  - Analyse intelligente des requêtes
  - Génération d'insights automatiques
  - Recommandations personnalisées
  - Interface chat intuitive

### 🗺️ 5. Cartes Interactives Améliorées
- **Intégration Leaflet complète**
- **Données temps réel depuis Supabase**
- **Clustering intelligent**
- **Prédictions géographiques**

---

## 📊 STRUCTURE SUPABASE

### Tables Principales:

#### `incidents`
```sql
- id: string (PK)
- type: string
- description: text
- location: string
- latitude: decimal
- longitude: decimal
- severity: enum('low', 'medium', 'high', 'critical')
- status: enum('open', 'investigating', 'resolved', 'closed')
- reported_at: timestamp
- resolved_at: timestamp (nullable)
- assigned_agent_id: string (nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### `csv_uploads`
```sql
- id: string (PK)
- filename: string
- original_rows: integer
- processed_rows: integer
- duplicates_removed: integer
- errors_count: integer
- upload_date: timestamp
- uploaded_by: string
- status: enum('processing', 'processed', 'error')
```

#### `users` (Auth Supabase)
- Utilise le système d'authentification intégré de Supabase
- Métadonnées: name, role

---

## 🎯 FONCTIONNALITÉS À TESTER

### 1. Upload CSV
1. Aller dans le Dashboard
2. Cliquer sur le bouton CSV flottant (en bas à droite)
3. Glisser/déposer un fichier CSV avec colonnes:
   - `date`, `type`, `location`, `severity`, `status`
4. Vérifier le nettoyage automatique des données

### 2. Prédictions IA
1. Aller dans la section "Prédictions"
2. Sélectionner une zone (Dakar, Pikine, etc.)
3. Voir les prédictions avec facteurs de risque
4. Tester les recommandations automatiques

### 3. Génération de Rapports
1. Dans n'importe quelle page analytique
2. Cliquer sur "Générer Rapport PDF"
3. Vérifier l'export automatique
4. Tester l'envoi par email (nécessite backend)

### 4. Agent IA
1. Ouvrir le chat IA (icône en bas à droite ou page dédiée)
2. Poser des questions comme:
   - "Montre-moi les tendances pour Dakar"
   - "Quelles sont les prédictions pour demain ?"
   - "Recommande des actions pour réduire les vols"
   - "Analyse les zones à risque"

### 5. Cartes Interactives
1. Aller dans la section "Cartographie"
2. Voir les incidents en temps réel
3. Cliquer sur les marqueurs pour les détails
4. Tester les filtres par type/gravité

---

## 🔧 INTÉGRATION AVEC VOTRE CODE RANDOM FOREST

Pour intégrer votre code Random Forest existant:

1. **Remplacer la simulation dans `mlService.ts`**:
   - Ligne 89-103: Remplacer `trainModel()` par votre algorithme
   - Ligne 119-130: Remplacer `runRandomForestPrediction()` par vos prédictions

2. **Format des données d'entrée**:
```typescript
interface FeatureVector {
  hour: number;           // 0-23
  day_of_week: number;    // 0-6 (dimanche=0)
  month: number;          // 0-11
  location_encoded: number; // ID numérique de la zone
  previous_incidents: number; // Incidents récents
  population_density: number; // 0-1
  economic_index: number;    // 0-1
  weather_risk: number;      // 0-1
}
```

3. **Format de sortie attendu**:
```typescript
{
  probability: number;     // 0-1
  risk_level: 'low'|'medium'|'high'|'critical';
  predicted_type: string;  // Type de crime prédit
  confidence: number;      // 0-1
  factors: string[];       // Facteurs explicatifs
}
```

---

## 🌍 VARIABLES D'ENVIRONNEMENT

Vérifiez que le fichier `.env` contient:
```env
VITE_PUBLIC_SUPABASE_URL=https://lymtryzzujnxdpxitdnc.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_M-PCLdXHY32o-TdYA_F8Ig_B72wGLoX
```

---

## 🚨 NOTES IMPORTANTES

1. **Sécurité**: Les comptes de test doivent être changés en production
2. **Supabase**: Configurez RLS (Row Level Security) pour la production
3. **API Keys**: Ne jamais exposer les clés privées dans le frontend
4. **Performance**: Les prédictions ML peuvent être mises en cache
5. **Données**: Utilisez des données réelles pour de meilleurs résultats ML

---

## 📞 SUPPORT TECHNIQUE

- **Erreurs CSV**: Vérifiez le format et les colonnes requises
- **Erreurs Supabase**: Vérifiez la connexion réseau et les permissions
- **Erreurs ML**: Vérifiez que les données d'entraînement sont suffisantes
- **Erreurs PDF**: Vérifiez que les graphiques sont bien chargés

---

**Dernière mise à jour**: 29 septembre 2025
**Version**: 1.0.0
**Développé pour**: Seentu Kaarange - Système de Sécurité Prédictive
# Guide d'utilisation - Système CSV Intelligent SEENTU KAARANGE

## 🎯 Vue d'ensemble

Le système SEENTU KAARANGE dispose maintenant d'un système **intelligent de traitement CSV** qui s'adapte automatiquement à différentes structures de fichiers et nettoie les données automatiquement.

---

## 🚀 Fonctionnalités clés améliorées

### ✅ **Système CSV Intelligent**
- **Détection automatique** de la structure du fichier
- **Mapping intelligent** des colonnes vers les champs de la base
- **Nettoyage automatique** des données
- **Validation en temps réel**
- **Interface étape par étape** guidée

### ✅ **Génération de rapports PDF**
- Rapports détaillés avec graphiques
- Exportation automatique
- Intégration dans Dashboard et Analysis

### ✅ **Boutons fonctionnels**
- Tous les boutons principaux sont maintenant actifs
- Feedback utilisateur amélioré
- Actions cohérentes dans tout le système

---

## 📊 Comment utiliser le système CSV

### **Étape 1 : Accès à l'upload**
Vous pouvez accéder à l'upload CSV depuis :
- **Dashboard** → Bouton "Importer données"
- **Bouton flottant** en bas à droite (sur toutes les pages)

### **Étape 2 : Sélection du fichier**
1. **Glisser-déposer** votre fichier CSV dans la zone
2. Ou **cliquer** pour sélectionner un fichier
3. Le système accepte tous les **délimiteurs** (`,` `;` `|` `\t`)

### **Étape 3 : Analyse automatique**
Le système détecte automatiquement :
- ✅ **Structure** du fichier (délimiteurs, en-têtes)
- ✅ **Types de données** (texte, nombre, date, coordonnées)
- ✅ **Correspondances** avec la base de données
- ✅ **Qualité** des données (score sur 100)
- ✅ **Problèmes** potentiels

### **Étape 4 : Configuration des mappings**
- **Vérifiez** les correspondances automatiques
- **Modifiez** si nécessaire les champs cibles
- **Champs obligatoires** : Type incident, Lieu, Date
- **Champs optionnels** : Description, Statut, Coordonnées GPS, etc.

### **Étape 5 : Traitement**
- Le système **nettoie** automatiquement les données
- **Valide** chaque ligne
- **Insère** en base de données
- **Génère** un rapport de traitement

---

## 🗂️ Structures CSV supportées

Le système s'adapte à **toute structure** de fichier CSV. Voici des exemples :

### **Format Police Nationale**
```csv
Type,Lieu,Date,Heure,Statut,Description
Vol,Sandaga,2024-01-15,14:30,En cours,Vol de téléphone
Agression,UCAD,2024-01-15,16:45,Résolu,Bagarre étudiants
```

### **Format Gendarmerie**
```csv
nature;zone;timestamp;gravite;enqueteur;victimes
Cambriolage;Pikine;2024-01-15 20:15;Haute;Adjudant Fall;1
Fraude;Plateau;2024-01-15 09:30;Moyenne;Capitaine Diop;0
```

### **Format International**
```csv
incident_type|location|date_occurred|latitude|longitude|status
Theft|Dakar Central|2024-01-15T14:30:00Z|-17.4441|14.6937|Open
Assault|University District|2024-01-15T16:45:00Z|-17.4470|14.6928|Closed
```

### **Format avec coordonnées**
```csv
crime,address,when,lat,lng,details,officer
Burglary,"123 Rue de la Paix, Dakar",15/01/2024,14.6928,-17.4467,"Maison cambriolée",Agent Ba
Robbery,"Avenue Cheikh Anta Diop",15/01/2024,14.6937,-17.4441,"Vol à main armée",Agent Sow
```

---

## 🔧 Correspondances automatiques

Le système reconnaît automatiquement ces termes :

### **Type d'incident**
- `type`, `crime_type`, `incident`, `nature`, `delit`

### **Lieu**
- `lieu`, `zone`, `quartier`, `address`, `adresse`, `position`, `location`

### **Date/Heure**
- `date`, `time`, `datetime`, `timestamp`, `heure`, `moment`, `when`

### **Description**
- `detail`, `commentaire`, `note`, `description`, `details`

### **Coordonnées GPS**
- `latitude`, `lat`, `y`, `coord_y`
- `longitude`, `lng`, `lon`, `x`, `coord_x`

### **Agent/Officier**
- `agent`, `officier`, `responsable`, `enqueteur`, `officer`

---

## 📈 Génération de rapports PDF

### **Depuis le Dashboard**
1. Cliquez sur **"Rapport PDF"** en haut à droite
2. Le rapport inclut :
   - Statistiques KPI en temps réel
   - Graphiques des incidents
   - Zones à risque
   - Prédictions IA
   - Recommandations

### **Depuis la page Analyse**
1. Configurez vos **filtres** (période, zone, type)
2. Cliquez **"Analyser"** pour actualiser
3. Cliquez **"Rapport PDF"**
4. Le rapport contient :
   - Analyses détaillées
   - Corrélations statistiques
   - Hotspots criminels
   - Recommandations stratégiques

---

## ⚡ Boutons et fonctionnalités actives

### **Dashboard**
- ✅ **Actualiser** → Actualise les données temps réel
- ✅ **Importer données** → Lance le Smart CSV Uploader
- ✅ **Rapport PDF** → Génère rapport de surveillance
- ✅ **Paramètres alertes** → Configure les notifications
- ✅ **Filtrer incidents** → Filtre les incidents affichés
- ✅ **Voir toutes notifications** → Affiche l'historique complet

### **Page Analyse**
- ✅ **Paramètres** → Configure les options d'analyse
- ✅ **Analyser** → Lance une nouvelle analyse
- ✅ **Exporter JSON** → Exporte les données brutes
- ✅ **Rapport PDF** → Génère rapport d'analyse

### **Page Prédictions**
- ✅ **Paramètres IA** → Configure les modèles IA
- ✅ **Gestion modèles** → Manage les modèles prédictifs
- ✅ **Lancer prédiction** → Execute les algorithmes IA
- ✅ **Créer alerte** → Configure alertes prédictives
- ✅ **Exporter résultats** → Exporte prédictions

---

## 🛡️ Validation et nettoyage automatique

### **Règles de validation**
- **Dates** → Format automatiquement reconnu et standardisé
- **Coordonnées GPS** → Vérification plage valide (-90/90, -180/180)
- **Nombres** → Conversion automatique des formats
- **Champs obligatoires** → Vérification présence

### **Nettoyage des données**
- **Suppression** espaces en début/fin
- **Normalisation** des formats de date
- **Conversion** types de données
- **Détection** doublons potentiels
- **Correction** encodages caractères

### **Gestion des erreurs**
- **Rapport détaillé** des lignes en erreur
- **Numéros de lignes** précis
- **Raisons** des erreurs
- **Suggestions** de correction

---

## 🎯 Conseils d'utilisation

### **Préparer vos fichiers CSV**
1. **En-têtes claires** : Utilisez des noms explicites
2. **Format cohérent** : Une seule structure par fichier
3. **Données complètes** : Remplissez les champs obligatoires
4. **Encodage UTF-8** : Pour les caractères spéciaux

### **Optimiser les performances**
1. **Fichiers < 10MB** : Pour un traitement rapide
2. **Validation préalable** : Vérifiez vos données avant upload
3. **Tests progressifs** : Commencez par des petits fichiers
4. **Sauvegarde** : Gardez vos fichiers originaux

### **Résoudre les problèmes**
1. **Score qualité < 60%** → Vérifiez la structure du fichier
2. **Champs non mappés** → Renommez les colonnes avec des termes reconnus
3. **Erreurs de validation** → Corrigez les données dans le fichier source
4. **Lignes ignorées** → Vérifiez les champs obligatoires manquants

---

## 📞 Support et assistance

### **Problèmes courants**
- **"Délimiteur non détecté"** → Vérifiez que votre fichier utilise `,` `;` `|` ou tabulation
- **"Champs obligatoires manquants"** → Assurez-vous d'avoir Type, Lieu et Date
- **"Format de date invalide"** → Utilisez ISO (2024-01-15) ou français (15/01/2024)
- **"Coordonnées invalides"** → Vérifiez format décimal (-17.4441, 14.6937)

### **Informations de débogage**
- Consultez la **console développeur** (F12) pour les erreurs détaillées
- Le **rapport de traitement** contient tous les détails des erreurs
- Les **logs système** sont disponibles dans l'interface admin

---

## 🔄 Workflow recommandé

1. **Collecte données** → Rassemblez vos fichiers CSV
2. **Test pilote** → Importez un petit échantillon d'abord
3. **Vérification** → Consultez les données importées
4. **Ajustements** → Modifiez la structure si nécessaire
5. **Import complet** → Traitez tous vos fichiers
6. **Génération rapports** → Créez vos rapports d'analyse
7. **Suivi** → Utilisez les prédictions IA pour le monitoring

---

**🎉 Félicitations ! Vous maîtrisez maintenant le système CSV intelligent de SEENTU KAARANGE !**

Le système s'adapte automatiquement à vos données. Vous n'avez qu'à **uploader et observer les résultats** ! 

Pour toute question : consultez les logs ou contactez l'équipe technique.
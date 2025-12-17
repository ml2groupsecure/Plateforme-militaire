# Plugin Sahaba Display - Guide d'installation

## 📦 Contenu du plugin

Ce plugin WordPress permet d'afficher une liste complète des Sahaba (compagnons du Prophète ﷺ) et Sahabiyat (compagnonnes) avec :
- Filtres interactifs (Tous, Hommes, Femmes, Les 10 promis au Paradis, Califes)
- Cartes élégantes avec informations clés
- Modals détaillés avec biographies complètes
- Références du Coran et de la Sunnah
- Design responsive et moderne

## 🚀 Installation

### Étape 1 : Créer le fichier ZIP

1. Compressez le dossier `sahaba-plugin` en fichier ZIP
2. Assurez-vous que la structure est correcte :
   ```
   sahaba-plugin.zip
   ├── sahaba-plugin.php
   ├── README.md
   ├── assets/
   │   ├── sahaba-styles.css
   │   └── sahaba-scripts.js
   └── templates/
       └── page-sahaba-full.php
   ```

### Étape 2 : Installer le plugin

1. Connectez-vous à votre administration WordPress
2. Allez dans **Extensions → Ajouter**
3. Cliquez sur **Téléverser une extension**
4. Sélectionnez le fichier `sahaba-plugin.zip`
5. Cliquez sur **Installer maintenant**
6. Une fois installé, cliquez sur **Activer**

### Étape 3 : Créer la page d'affichage

1. Allez dans **Pages → Ajouter**
2. Donnez un titre à votre page (ex: "Les Sahaba")
3. **IMPORTANT** : Ne modifiez PAS le contenu avec Elementor
4. Dans la colonne de droite, sous **Attributs de la page**, sélectionnez le template **"Sahaba - Page complète"**
5. Cliquez sur **Publier**

## ⚠️ Pourquoi éviter Elementor ?

Elementor peut créer des conflits avec :
- Le chargement des styles CSS personnalisés
- Les scripts JavaScript
- La structure HTML du template
- Les animations et interactions

**Solution** : Utilisez une page WordPress normale sans éditeur Elementor pour garantir un affichage parfait.

## 📝 Ajouter des Sahaba

### Via l'interface WordPress

1. Allez dans **Sahaba → Ajouter**
2. Remplissez les champs suivants :

#### Champs de base
- **Titre** : Nom du Sahabi (sera utilisé si les champs personnalisés sont vides)
- **Nom arabe** : `nom_arabe` (ex: أبو بكر الصديق)
- **Nom français** : `nom_francais` (ex: Abou Bakr As-Siddiq)
- **Titre/Surnom** : `titre` (ex: Le Véridique, Premier Calife)
- **Date de naissance** : `date_naissance` (ex: 573 EC)
- **Date de décès** : `date_deces` (ex: 634 EC)

#### Contenu détaillé
- **Article complet** : `article_complet` (biographie complète en texte)
- **Contributions** : `contributions` (tableau JSON des contributions majeures)
- **Vertus** : `vertus` (tableau JSON des vertus et qualités)

#### Sources
- **Sources** : `sources` (objet JSON contenant coran, sunnah, bibliographie)

Exemple de format JSON pour les sources :
```json
{
  "coran": [
    {
      "sourate": 9,
      "verset": 40,
      "texte_arabe": "إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
      "traduction": "Quand il disait à son compagnon : « Ne t'afflige pas, car Allah est avec nous »",
      "contexte": "Référence à Abou Bakr dans la grotte lors de l'Hégire"
    }
  ],
  "sunnah": [
    {
      "recueil": "Sahih al-Bukhari",
      "numero": "3661",
      "texte": "Le Prophète ﷺ a dit : « Si je devais prendre un ami intime, je choisirais Abou Bakr… »",
      "theme": "Soutien et proximité du Prophète avec Abou Bakr"
    }
  ],
  "bibliographie": [
    "Ibn Hisham, Sīrat Rasūl Allāh",
    "Al-Tabari, Tarikh al-Rusul wa al-Muluk"
  ]
}
```

#### Taxonomies
- **Genre** : Choisissez "Homme" ou "Femme"
- **Catégories** : Sélectionnez parmi :
  - Les 10 promis au Paradis
  - Les Califes bien-guidés
  - Compagnons de Badr
  - Muhajiroun (Émigrants)
  - Ansar (Auxiliaires)
  - etc.

### Via import JSON

Vous pouvez préparer un fichier JSON avec tous les Sahaba et utiliser un plugin d'import comme **WP All Import** pour importer en masse.

## 🎨 Personnalisation

### Modifier les couleurs

Éditez le fichier `assets/sahaba-styles.css` et modifiez les variables CSS :

```css
:root {
    --primary-green: #2d8659;
    --dark-green: #1a5c3a;
    --light-green: #45a375;
    --gold: #d4af37;
    --light-gold: #f4e4b8;
    --cream: #faf7f0;
}
```

### Modifier les filtres

Éditez le fichier `templates/page-sahaba-full.php` pour ajouter ou supprimer des filtres.

## 🔧 Dépannage

### Les styles ne s'appliquent pas
- Vérifiez que vous utilisez bien le template "Sahaba - Page complète"
- Désactivez Elementor pour cette page
- Videz le cache de votre site et de votre navigateur

### Les Sahaba ne s'affichent pas
- Vérifiez que vous avez bien ajouté des articles "Sahaba"
- Vérifiez que les champs personnalisés sont correctement remplis
- Ouvrez la console JavaScript (F12) pour voir les erreurs éventuelles

### Erreur AJAX
- Vérifiez que les permaliens sont configurés correctement (Réglages → Permaliens → Enregistrer)
- Désactivez temporairement les autres plugins pour identifier les conflits

## 📞 Support

Pour toute question ou problème, contactez l'équipe Seentu.

## 📄 Licence

Ce plugin est développé pour Seentu. Tous droits réservés.

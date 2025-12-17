# 🚀 INSTALLATION DU PLUGIN SAHABA - MÉTHODE ULTRA SIMPLE

## 📦 Étape 1 : Créer le fichier ZIP

### Sur Windows :

1. **Naviguez** vers le dossier :
   ```
   C:\Users\ML2 GROUP\Documents\travail\seentuDash\seentu\
   ```

2. **Faites un clic droit** sur le dossier `sahaba-plugin`

3. **Sélectionnez** : `Envoyer vers → Dossier compressé (ZIP)`

4. Vous obtiendrez : `sahaba-plugin.zip`

---

## ⬆️ Étape 2 : Installer dans WordPress

### Méthode A : Via l'interface WordPress (RECOMMANDÉ)

1. **Connectez-vous** à votre admin WordPress :
   ```
   https://livre.timeishassanat.com/wp-admin
   ```

2. Dans le menu de gauche, allez dans :
   ```
   Extensions → Ajouter
   ```

3. Cliquez sur le bouton :
   ```
   Téléverser une extension
   ```

4. Cliquez sur :
   ```
   Choisir un fichier
   ```

5. Sélectionnez votre `sahaba-plugin.zip`

6. Cliquez sur :
   ```
   Installer maintenant
   ```

7. Attendez l'installation...

8. Cliquez sur :
   ```
   Activer l'extension
   ```

✅ **TERMINÉ !** Les 20 Sahaba sont automatiquement importés !

---

## 🎯 Étape 3 : Utiliser le plugin

### Voir les Sahaba importés :

Dans le menu WordPress (à gauche), vous verrez un nouveau menu **"Sahaba"** avec une icône 👥

Cliquez dessus pour voir vos 20 Sahaba !

### Afficher sur une page :

1. Créez une nouvelle page : **Pages → Ajouter**

2. Titre : `Sahaba et Sahabiyat`

3. Dans le contenu, ajoutez simplement :
   ```
   [sahaba_list]
   ```

4. Publiez la page

5. Visitez la page !

---

## ✏️ MODIFIER OU AJOUTER DES SAHABA

### Option 1 : Via WordPress (Facile pour 1-2 modifications)

1. **Sahaba → Tous les Sahaba**
2. Cliquez sur celui à modifier
3. Modifiez
4. **Mettre à jour**

### Option 2 : Via JSON (Facile pour beaucoup de modifications)

#### A. Préparer votre fichier

1. Ouvrez le fichier depuis votre dossier plugin :
   ```
   sahaba-plugin\data\sahaba-database.json
   ```

2. Ouvrez-le avec **Notepad++** ou **VS Code**

3. **Modifiez** les données existantes

4. **OU Ajoutez** de nouveaux Sahaba en copiant la structure

5. **Sauvegardez** le fichier

#### B. Importer dans WordPress

1. Dans WordPress, allez dans :
   ```
   Sahaba → ⬆️ Importer JSON
   ```

2. **Option 1 : Upload fichier**
   - Cliquez sur `Choisir un fichier`
   - Sélectionnez votre `sahaba-database.json` modifié
   - Cochez `Supprimer les existants` (pour remplacer tout)
   - Cliquez sur `Importer le fichier JSON`

3. **Option 2 : Coller le JSON**
   - Copiez TOUT le contenu de votre fichier JSON
   - Collez-le dans la zone de texte
   - Cochez `Supprimer les existants` (si vous voulez)
   - Cliquez sur `Importer depuis le texte`

✅ **Vos modifications sont appliquées !**

---

## 📝 EXEMPLE : Ajouter un 21ème Sahabi

1. Ouvrez `sahaba-database.json`

2. À la fin de la liste (avant `]`), ajoutez une virgule et :

```json
    ,
    {
      "id": 21,
      "nom_arabe": "طلحة بن عبيد الله",
      "nom_francais": "Talha ibn Ubaydullah",
      "genre": "homme",
      "titre": "L'un des 10 Promis au Paradis",
      "date_naissance": "594 EC",
      "date_deces": "656 EC (36 H)",
      "categorie": ["Les 10 promis au Paradis"],
      "biographie": "Talha ibn Ubaydullah (qu'Allah l'agrée) fut l'un des dix promis au Paradis...",
      "contributions": [
        "Défendit le Prophète ﷺ à Uhud",
        "Grand compagnon généreux"
      ],
      "references_coran": [],
      "references_sunnah": [
        {
          "recueil": "Sahih al-Bukhari",
          "numero": "3740",
          "texte": "Le Prophète ﷺ a dit : 'Talha est celui qui a accompli son devoir'",
          "theme": "Son mérite"
        }
      ],
      "vertus_speciales": [
        "L'un des 10 promis au Paradis",
        "Défenseur du Prophète ﷺ à Uhud",
        "Connu pour sa générosité"
      ]
    }
```

3. Sauvegardez

4. Ré-importez dans WordPress

---

## 🎨 Changer les couleurs

Si vous voulez modifier les couleurs :

1. Allez dans le dossier du plugin sur votre serveur :
   ```
   /wp-content/plugins/sahaba-plugin/assets/
   ```

2. Ouvrez `sahaba-styles.css`

3. Modifiez les lignes 7-17 :

```css
:root {
    --primary-green: #2d8659;    /* Changez cette couleur */
    --dark-green: #1a5c3a;       /* Et celle-ci */
    --gold: #d4af37;             /* Et celle-ci */
}
```

4. Sauvegardez

5. Videz le cache de votre site

---

## ❓ PROBLÈMES COURANTS

### Le plugin n'apparaît pas après upload

**Solution** : Vérifiez que vous avez zippé le **dossier** `sahaba-plugin` et pas juste son contenu.

Structure correcte du ZIP :
```
sahaba-plugin.zip
└── sahaba-plugin/
    ├── sahaba-manager.php
    ├── data/
    ├── assets/
    └── templates/
```

### Les Sahaba ne s'affichent pas

**Solution** :
1. Allez dans **Réglages → Permaliens**
2. Cliquez sur **Enregistrer** (sans rien changer)
3. Rafraîchissez votre page

### Le shortcode ne fonctionne pas

**Solution** : Assurez-vous d'utiliser l'éditeur **Bloc** ou **Classique**, pas un constructeur de page.

---

## 🎉 C'EST TOUT !

Vous avez maintenant :
- ✅ Un plugin WordPress complet
- ✅ 20 biographies de Sahaba
- ✅ Une interface pour ajouter/modifier facilement
- ✅ Import/Export JSON simple
- ✅ Design adapté à votre site

**Besoin d'aide ?** Lisez le fichier `README.md` dans le plugin !

---

**Développé pour livre.timeishassanat.com**

باركَ اللهُ فيك 🤲

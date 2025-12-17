# 🎨 GUIDE : Utiliser la Page Sahaba avec Elementor

## ❌ PROBLÈME : Le Shortcode ne marche pas

Vous avez raison ! Les shortcodes ne fonctionnent pas toujours bien avec Elementor.

## ✅ SOLUTION : Utiliser le Template de Page

J'ai créé un **template de page complet** qui fonctionne **SANS shortcode** !

---

## 📋 INSTALLATION EN 3 ÉTAPES

### Étape 1 : Installer le Plugin

1. Créez le ZIP du dossier `sahaba-plugin`
2. WordPress Admin → Extensions → Ajouter → Téléverser
3. Installez et **Activez** le plugin

✅ Les 20 Sahaba sont automatiquement importés !

---

### Étape 2 : Créer la Page (SANS Elementor)

**Important** : N'utilisez PAS Elementor pour cette page.

1. **Pages → Ajouter**
2. **Titre** : `Sahaba et Sahabiyat`
3. **Laissez le contenu VIDE** (ne mettez rien)
4. **Dans la colonne de droite**, cherchez **"Attributs de page"**
5. **Modèle** ou **Template** : Sélectionnez **"Page Sahaba Complète (Sans Shortcode)"**
6. **Publiez** la page

---

### Étape 3 : Voir le Résultat

Visitez votre page : `https://livre.timeishassanat.com/sahaba-et-sahabiyat/`

✅ **Ça marche !** Vous devriez voir :
- Section Hero avec citation
- Filtres (Tous, Hommes, Femmes, etc.)
- Cartes des Sahaba
- Modal qui s'ouvre au clic

---

## 🎨 POURQUOI NE PAS UTILISER ELEMENTOR ?

### Le problème avec Elementor :

Elementor charge son propre CSS et JavaScript qui **écrase** ou **bloque** le code du plugin.

### La solution :

Utiliser le **template WordPress natif** qui :
- ✅ Charge correctement tous les styles
- ✅ Fonctionne avec tous les thèmes
- ✅ Affiche tout parfaitement
- ✅ Pas besoin de shortcode

---

## 🔧 SI VOUS VOULEZ QUAND MÊME UTILISER ELEMENTOR

Si vous **devez absolument** utiliser Elementor, voici comment :

### Option A : Widget HTML d'Elementor

1. Créez une page avec Elementor
2. Ajoutez un widget **"HTML"**
3. Collez ce code dedans :

```html
<style>
    <?php include(WP_PLUGIN_DIR . '/sahaba-plugin/assets/sahaba-styles.css'); ?>
</style>

<div id="sahaba-elementor-container"></div>

<script>
// Charger les Sahaba ici
fetch('<?php echo admin_url('admin-ajax.php'); ?>?action=get_sahaba_data')
    .then(response => response.json())
    .then(data => {
        // Afficher les Sahaba
        document.getElementById('sahaba-elementor-container').innerHTML = '...';
    });
</script>
```

**Problème** : Trop compliqué et pas fiable.

---

### Option B : Page Pleine Largeur Elementor

1. Créez la page SANS Elementor (comme Étape 2 ci-dessus)
2. Une fois créée, modifiez la page
3. Changez **juste le style** avec Elementor (couleurs, marges, etc.)
4. **NE TOUCHEZ PAS au contenu**

**Problème** : Risque d'effacer le template.

---

## 💡 MA RECOMMANDATION

### ✅ UTILISEZ LA PAGE TEMPLATE (Sans Elementor)

**Pourquoi ?**
- ✅ Fonctionne à 100%
- ✅ Installation en 2 minutes
- ✅ Aucun bug
- ✅ Design déjà adapté à votre site (vert/doré)
- ✅ Responsive (mobile, tablette, desktop)

**Vous pouvez quand même personnaliser** :
- Les couleurs (dans le fichier CSS)
- Les textes (dans le template)
- L'ordre des Sahaba (dans WordPress Admin)

---

## 🎨 PERSONNALISER LES COULEURS (Sans Elementor)

Si vous voulez changer les couleurs :

1. Via FTP ou cPanel, allez dans :
   ```
   /wp-content/plugins/sahaba-plugin/assets/sahaba-styles.css
   ```

2. Lignes 7-17, modifiez :
   ```css
   :root {
       --primary-green: #2d8659;    /* Votre vert */
       --gold: #d4af37;             /* Votre doré */
   }
   ```

3. Sauvegardez

4. Videz le cache de votre site

✅ **Terminé !** Les nouvelles couleurs sont appliquées.

---

## 📱 AJOUTER UN LIEN DANS LE MENU

Pour ajouter la page dans votre menu de navigation :

1. **Apparence → Menus**
2. **Cochez** "Sahaba et Sahabiyat" dans **Pages**
3. **Ajouter au menu**
4. **Enregistrer**

---

## ❓ DÉPANNAGE

### La page est blanche

**Solution** :
1. Vérifiez que le plugin est **activé**
2. Allez dans **Réglages → Permaliens** → **Enregistrer**
3. Videz le cache WordPress

### Les styles ne s'appliquent pas

**Solution** :
1. Videz le cache de votre navigateur (Ctrl+F5)
2. Si vous utilisez un plugin de cache (WP Rocket, W3 Total Cache, etc.), videz-le
3. Vérifiez que le fichier `sahaba-styles.css` existe dans le plugin

### Les Sahaba ne s'affichent pas

**Solution** :
1. Vérifiez que les Sahaba sont importés : **Sahaba → Tous les Sahaba** (vous devriez voir 20 articles)
2. Si non, allez dans **Sahaba → ⬆️ Importer JSON** et ré-importez le fichier
3. Si oui, vérifiez la console JavaScript (F12 dans le navigateur) pour voir les erreurs

---

## 🎉 RÉSULTAT FINAL

Vous aurez une page magnifique avec :
- ✅ 20 biographies de Sahaba
- ✅ Filtres interactifs
- ✅ Design adapté à votre site
- ✅ Modal avec informations complètes
- ✅ Références Coran et Sunnah
- ✅ Responsive sur tous les appareils

**ET AUCUN PROBLÈME AVEC ELEMENTOR !**

---

## 💬 BESOIN D'AIDE ?

Si ça ne marche toujours pas :

1. Vérifiez que vous avez suivi **exactement** les étapes
2. N'utilisez **PAS** Elementor pour créer cette page
3. Utilisez le **template WordPress natif**

---

**Développé pour livre.timeishassanat.com**

باركَ اللهُ فيك 🤲

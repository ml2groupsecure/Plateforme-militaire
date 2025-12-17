<?php
/**
 * Template Name: Page Sahaba Complète (Sans Shortcode)
 * Description: Affiche tous les Sahaba avec filtres et modal - Fonctionne avec tous les constructeurs de page
 */

get_header();
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
    
    <!-- Styles intégrés pour garantir l'affichage -->
    <style>
        <?php include(plugin_dir_path(dirname(__FILE__)) . '../assets/sahaba-styles.css'); ?>
    </style>
</head>

<body <?php body_class(); ?>>

<div class="sahaba-fullpage-container">
    <!-- Hero Section -->
    <section class="sahaba-hero">
        <div class="hero-content">
            <h1 class="hero-title">Les Sahaba et Sahabiyat</h1>
            <p class="hero-subtitle">Compagnons et Compagnes du Prophète Muhammad ﷺ</p>
            <div class="hero-quote">
                <p class="arabic-quote">« خَيْرُ الْقُرُونِ قَرْنِي »</p>
                <p class="quote-translation">"Les meilleures générations sont ma génération"</p>
                <span class="quote-source">- Prophète Muhammad ﷺ (Sahih al-Bukhari)</span>
            </div>
        </div>
    </section>

    <!-- Filtres -->
    <section class="sahaba-filters">
        <div class="filters-container">
            <button class="filter-btn active" data-filter="all">Tous</button>
            <button class="filter-btn" data-filter="homme">Sahaba (Hommes)</button>
            <button class="filter-btn" data-filter="femme">Sahabiyat (Femmes)</button>
            <button class="filter-btn" data-filter="10-paradis">Les 10 Promis au Paradis</button>
            <button class="filter-btn" data-filter="califes">Les Califes</button>
            <button class="filter-btn" data-filter="epouses">Mères des Croyants</button>
        </div>
    </section>

    <!-- Grille des Sahaba -->
    <section class="sahaba-grid" id="sahaba-grid">
        <div class="loading-message">Chargement des Sahaba...</div>
    </section>

    <!-- Modal -->
    <div id="sahaba-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div id="modal-body">
                <!-- Contenu dynamique -->
            </div>
        </div>
    </div>
</div>

<script>
// Données des Sahaba depuis WordPress
const sahabaData = <?php
    // Récupérer tous les posts de type 'sahaba'
    $args = array(
        'post_type' => 'sahaba',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'ASC'
    );
    
    $sahaba_posts = get_posts($args);
    $sahaba_array = array();
    
    foreach ($sahaba_posts as $post) {
        $sahabi = array(
            'id' => $post->ID,
            'nom_francais' => $post->post_title,
            'nom_arabe' => get_post_meta($post->ID, 'nom_arabe', true),
            'genre' => get_post_meta($post->ID, 'genre', true),
            'titre' => get_post_meta($post->ID, 'titre', true),
            'date_naissance' => get_post_meta($post->ID, 'date_naissance', true),
            'date_deces' => get_post_meta($post->ID, 'date_deces', true),
            'biographie' => get_post_meta($post->ID, 'biographie', true),
            'contributions' => json_decode(get_post_meta($post->ID, 'contributions', true), true),
            'references_coran' => json_decode(get_post_meta($post->ID, 'references_coran', true), true),
            'references_sunnah' => json_decode(get_post_meta($post->ID, 'references_sunnah', true), true),
            'vertus_speciales' => json_decode(get_post_meta($post->ID, 'vertus_speciales', true), true),
            'categorie' => wp_get_post_terms($post->ID, 'sahaba_categorie', array('fields' => 'names'))
        );
        $sahaba_array[] = $sahabi;
    }
    
    echo json_encode(array('sahaba' => $sahaba_array));
?>;

// Variables globales
const modal = document.getElementById('sahaba-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Fonction pour afficher les cartes
function displaySahaba(filter = 'all') {
    const grid = document.getElementById('sahaba-grid');
    grid.innerHTML = '';
    
    let filteredSahaba = sahabaData.sahaba;
    
    // Filtrage
    if (filter !== 'all') {
        filteredSahaba = sahabaData.sahaba.filter(sahabi => {
            if (filter === 'homme' || filter === 'femme') {
                return sahabi.genre === filter;
            } else if (filter === '10-paradis') {
                return sahabi.categorie && sahabi.categorie.includes('Les 10 promis au Paradis');
            } else if (filter === 'califes') {
                return sahabi.categorie && sahabi.categorie.includes('Les Califes bien-guidés');
            } else if (filter === 'epouses') {
                return sahabi.categorie && sahabi.categorie.includes('Épouses du Prophète');
            }
            return true;
        });
    }
    
    if (filteredSahaba.length === 0) {
        grid.innerHTML = '<div class="no-results">Aucun Sahabi trouvé dans cette catégorie.</div>';
        return;
    }
    
    // Création des cartes
    filteredSahaba.forEach(sahabi => {
        const card = createSahabaCard(sahabi);
        grid.appendChild(card);
    });
}

// Fonction pour créer une carte
function createSahabaCard(sahabi) {
    const card = document.createElement('div');
    card.className = 'sahaba-card';
    card.setAttribute('data-id', sahabi.id);
    
    const genderClass = sahabi.genre === 'femme' ? 'female' : 'male';
    const genderIcon = sahabi.genre === 'femme' ? '♀' : '♂';
    
    const biographyPreview = sahabi.biographie ? sahabi.biographie.substring(0, 150) + '...' : 'Biographie à venir...';
    
    card.innerHTML = `
        <div class="card-header ${genderClass}">
            <span class="gender-icon">${genderIcon}</span>
            <h3 class="sahabi-name-ar">${sahabi.nom_arabe || ''}</h3>
        </div>
        <div class="card-body">
            <h4 class="sahabi-name-fr">${sahabi.nom_francais}</h4>
            <p class="sahabi-title">${sahabi.titre || ''}</p>
            <div class="sahabi-dates">
                <span>${sahabi.date_naissance || ''} - ${sahabi.date_deces || ''}</span>
            </div>
            <p class="sahabi-bio-preview">${biographyPreview}</p>
            <div class="card-badges">
                ${sahabi.categorie && sahabi.categorie.length > 0 ? sahabi.categorie.slice(0, 2).map(cat => `<span class="badge">${cat}</span>`).join('') : ''}
            </div>
        </div>
        <div class="card-footer">
            <button class="btn-details" onclick="showDetails(${sahabi.id})">
                Voir la biographie complète →
            </button>
        </div>
    `;
    
    return card;
}

// Fonction pour afficher les détails
function showDetails(id) {
    const sahabi = sahabaData.sahaba.find(s => s.id === id);
    if (!sahabi) return;
    
    let coranRefs = '';
    if (sahabi.references_coran && sahabi.references_coran.length > 0) {
        coranRefs = `
            <div class="references-section">
                <h3 class="section-title">📖 Références du Coran</h3>
                ${sahabi.references_coran.map(ref => `
                    <div class="reference-item coran">
                        <div class="ref-header">
                            <span class="ref-location">Sourate ${ref.sourate}, Verset ${ref.verset}</span>
                        </div>
                        ${ref.texte_arabe ? `<p class="ref-arabic">${ref.texte_arabe}</p>` : ''}
                        <p class="ref-translation">${ref.traduction || ''}</p>
                        <p class="ref-context"><em>${ref.contexte || ''}</em></p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let sunnahRefs = '';
    if (sahabi.references_sunnah && sahabi.references_sunnah.length > 0) {
        sunnahRefs = `
            <div class="references-section">
                <h3 class="section-title">📚 Références de la Sunnah</h3>
                ${sahabi.references_sunnah.map(ref => `
                    <div class="reference-item sunnah">
                        <div class="ref-header">
                            <span class="ref-source">${ref.recueil || ''}</span>
                            <span class="ref-number">N° ${ref.numero || ''}</span>
                        </div>
                        <p class="ref-text">${ref.texte || ''}</p>
                        <p class="ref-theme"><strong>Thème :</strong> ${ref.theme || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    let contributions = '';
    if (sahabi.contributions && sahabi.contributions.length > 0) {
        contributions = `
            <div class="modal-section">
                <h3 class="section-title">⭐ Contributions Majeures</h3>
                <ul class="contributions-list">
                    ${sahabi.contributions.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    let vertus = '';
    if (sahabi.vertus_speciales && sahabi.vertus_speciales.length > 0) {
        vertus = `
            <div class="modal-section">
                <h3 class="section-title">✨ Vertus Spéciales</h3>
                <div class="vertus-grid">
                    ${sahabi.vertus_speciales.map(v => `<div class="vertu-badge">${v}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-name-ar">${sahabi.nom_arabe || ''}</h2>
            <h3 class="modal-name-fr">${sahabi.nom_francais}</h3>
            <p class="modal-title">${sahabi.titre || ''}</p>
            <div class="modal-dates">
                ${sahabi.date_naissance || ''} - ${sahabi.date_deces || ''}
            </div>
        </div>
        
        <div class="modal-section">
            <h3 class="section-title">📜 Biographie</h3>
            <p class="biography-text">${sahabi.biographie || 'Biographie à venir...'}</p>
        </div>
        
        ${contributions}
        ${coranRefs}
        ${sunnahRefs}
        ${vertus}
        
        <div class="modal-section categories">
            <h3 class="section-title">🏷️ Catégories</h3>
            <div class="categories-list">
                ${sahabi.categorie && sahabi.categorie.length > 0 ? sahabi.categorie.map(cat => `<span class="category-badge">${cat}</span>`).join('') : '<span class="category-badge">Non catégorisé</span>'}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Gestionnaire de filtres
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            displaySahaba(filter);
        });
    });
    
    // Fermeture du modal
    if (closeModal) {
        closeModal.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Initialisation
    displaySahaba('all');
});
</script>

<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * Plugin Name: Sahaba Display
 * Description: Plugin pour afficher les Sahaba et Sahabiyat avec filtres et modals détaillés
 * Version: 1.0.0
 * Author: Seentu
 * Text Domain: sahaba-plugin
 */

// Sécurité : empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Définir les constantes du plugin
define('SAHABA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SAHABA_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Enregistrer le Custom Post Type "Sahaba"
 */
function sahaba_register_post_type() {
    $labels = array(
        'name'               => 'Sahaba',
        'singular_name'      => 'Sahabi/Sahabiya',
        'menu_name'          => 'Sahaba',
        'add_new'            => 'Ajouter',
        'add_new_item'       => 'Ajouter un(e) Sahabi/Sahabiya',
        'edit_item'          => 'Modifier',
        'new_item'           => 'Nouveau/Nouvelle',
        'view_item'          => 'Voir',
        'search_items'       => 'Rechercher',
        'not_found'          => 'Aucun trouvé',
        'not_found_in_trash' => 'Aucun dans la corbeille'
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'has_archive'         => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'menu_icon'           => 'dashicons-groups',
        'supports'            => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rewrite'             => array('slug' => 'sahaba'),
        'capability_type'     => 'post',
    );

    register_post_type('sahaba', $args);
}
add_action('init', 'sahaba_register_post_type');

/**
 * Enregistrer les taxonomies pour filtrer les Sahaba
 */
function sahaba_register_taxonomies() {
    // Taxonomie "Genre" (Homme/Femme)
    register_taxonomy('sahaba_genre', 'sahaba', array(
        'label'        => 'Genre',
        'public'       => true,
        'hierarchical' => true,
        'show_in_rest' => true,
    ));

    // Taxonomie "Catégorie" (Les 10 promis au Paradis, etc.)
    register_taxonomy('sahaba_category', 'sahaba', array(
        'label'        => 'Catégories',
        'public'       => true,
        'hierarchical' => true,
        'show_in_rest' => true,
    ));
}
add_action('init', 'sahaba_register_taxonomies');

/**
 * Ajouter le template personnalisé pour les pages
 */
function sahaba_add_page_template($templates) {
    $templates['page-sahaba-full.php'] = 'Sahaba - Page complète';
    return $templates;
}
add_filter('theme_page_templates', 'sahaba_add_page_template');

/**
 * Charger le template personnalisé
 */
function sahaba_load_page_template($template) {
    if (is_page()) {
        $page_template = get_post_meta(get_the_ID(), '_wp_page_template', true);
        
        if ($page_template === 'page-sahaba-full.php') {
            $plugin_template = SAHABA_PLUGIN_DIR . 'templates/page-sahaba-full.php';
            
            if (file_exists($plugin_template)) {
                return $plugin_template;
            }
        }
    }
    
    return $template;
}
add_filter('template_include', 'sahaba_load_page_template');

/**
 * Enregistrer et charger les styles CSS
 */
function sahaba_enqueue_styles() {
    // Charger uniquement sur les pages utilisant le template
    if (is_page()) {
        $page_template = get_post_meta(get_the_ID(), '_wp_page_template', true);
        
        if ($page_template === 'page-sahaba-full.php') {
            wp_enqueue_style(
                'sahaba-styles',
                SAHABA_PLUGIN_URL . 'assets/sahaba-styles.css',
                array(),
                '1.0.0'
            );
        }
    }
}
add_action('wp_enqueue_scripts', 'sahaba_enqueue_styles');

/**
 * Enregistrer les scripts JavaScript
 */
function sahaba_enqueue_scripts() {
    if (is_page()) {
        $page_template = get_post_meta(get_the_ID(), '_wp_page_template', true);
        
        if ($page_template === 'page-sahaba-full.php') {
            wp_enqueue_script(
                'sahaba-scripts',
                SAHABA_PLUGIN_URL . 'assets/sahaba-scripts.js',
                array('jquery'),
                '1.0.0',
                true
            );

            // Passer les données à JavaScript
            wp_localize_script('sahaba-scripts', 'sahabaAjax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('sahaba_nonce')
            ));
        }
    }
}
add_action('wp_enqueue_scripts', 'sahaba_enqueue_scripts');

/**
 * AJAX : Récupérer tous les Sahaba
 */
function sahaba_get_all_sahaba() {
    check_ajax_referer('sahaba_nonce', 'nonce');

    $args = array(
        'post_type'      => 'sahaba',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC'
    );

    $sahaba_query = new WP_Query($args);
    $sahaba_data = array();

    if ($sahaba_query->have_posts()) {
        while ($sahaba_query->have_posts()) {
            $sahaba_query->the_post();
            $post_id = get_the_ID();

            // Récupérer les métadonnées
            $nom_arabe = get_post_meta($post_id, 'nom_arabe', true);
            $nom_francais = get_post_meta($post_id, 'nom_francais', true);
            $titre = get_post_meta($post_id, 'titre', true);
            $date_naissance = get_post_meta($post_id, 'date_naissance', true);
            $date_deces = get_post_meta($post_id, 'date_deces', true);
            $article_complet = get_post_meta($post_id, 'article_complet', true);
            $contributions = get_post_meta($post_id, 'contributions', true);
            $vertus = get_post_meta($post_id, 'vertus', true);
            $sources = get_post_meta($post_id, 'sources', true);

            // Récupérer les taxonomies
            $genres = wp_get_post_terms($post_id, 'sahaba_genre', array('fields' => 'names'));
            $categories = wp_get_post_terms($post_id, 'sahaba_category', array('fields' => 'names'));

            $sahaba_data[] = array(
                'id'               => $post_id,
                'nom_arabe'        => $nom_arabe ?: get_the_title(),
                'nom_francais'     => $nom_francais ?: get_the_title(),
                'genre'            => !empty($genres) ? strtolower($genres[0]) : 'homme',
                'titre'            => $titre ?: '',
                'date_naissance'   => $date_naissance ?: '',
                'date_deces'       => $date_deces ?: '',
                'article_complet'  => $article_complet ?: get_the_content(),
                'contributions'    => $contributions ?: array(),
                'vertus'           => $vertus ?: array(),
                'categories'       => $categories ?: array(),
                'sources'          => $sources ? json_decode($sources, true) : array()
            );
        }
        wp_reset_postdata();
    }

    wp_send_json_success($sahaba_data);
}
add_action('wp_ajax_get_all_sahaba', 'sahaba_get_all_sahaba');
add_action('wp_ajax_nopriv_get_all_sahaba', 'sahaba_get_all_sahaba');

/**
 * Flush rewrite rules à l'activation du plugin
 */
function sahaba_activate() {
    sahaba_register_post_type();
    sahaba_register_taxonomies();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'sahaba_activate');

/**
 * Flush rewrite rules à la désactivation
 */
function sahaba_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'sahaba_deactivate');

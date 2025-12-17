/**
 * Scripts pour la page Sahaba - Version plugin
 */

(function($) {
    'use strict';

    let allSahaba = [];
    let currentFilter = 'tous';

    $(document).ready(function() {
        loadSahaba();
        initFilters();
        initModal();
    });

    /**
     * Charger tous les Sahaba via AJAX
     */
    function loadSahaba() {
        $.ajax({
            url: sahabaAjax.ajax_url,
            type: 'POST',
            data: {
                action: 'get_all_sahaba',
                nonce: sahabaAjax.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    allSahaba = response.data;
                    displaySahaba(allSahaba);
                } else {
                    showNoResults();
                }
            },
            error: function() {
                showError();
            }
        });
    }

    /**
     * Afficher les cartes Sahaba
     */
    function displaySahaba(sahaba) {
        const grid = $('.sahaba-grid');
        grid.empty();

        if (sahaba.length === 0) {
            showNoResults();
            return;
        }

        sahaba.forEach(function(sahabi) {
            const card = createSahabaCard(sahabi);
            grid.append(card);
        });
    }

    /**
     * Créer une carte Sahaba
     */
    function createSahabaCard(sahabi) {
        const genderClass = sahabi.genre === 'femme' ? 'female' : 'male';
        const genderIcon = sahabi.genre === 'femme' ? '♀' : '♂';
        
        const bioPreview = sahabi.article_complet 
            ? sahabi.article_complet.substring(0, 200) + '...' 
            : '';

        let badgesHtml = '';
        if (sahabi.categories && Array.isArray(sahabi.categories) && sahabi.categories.length > 0) {
            sahabi.categories.forEach(function(cat) {
                badgesHtml += `<span class="badge">${cat}</span>`;
            });
        }

        const card = $(`
            <div class="sahaba-card" data-id="${sahabi.id}">
                <div class="card-header ${genderClass}">
                    <span class="gender-icon">${genderIcon}</span>
                    <h2 class="sahabi-name-ar">${sahabi.nom_arabe}</h2>
                </div>
                <div class="card-body">
                    <h3 class="sahabi-name-fr">${sahabi.nom_francais}</h3>
                    ${sahabi.titre ? `<p class="sahabi-title">${sahabi.titre}</p>` : ''}
                    ${sahabi.date_naissance || sahabi.date_deces ? `
                        <div class="sahabi-dates">
                            ${sahabi.date_naissance ? sahabi.date_naissance : '?'} - 
                            ${sahabi.date_deces ? sahabi.date_deces : '?'}
                        </div>
                    ` : ''}
                    <p class="sahabi-bio-preview">${bioPreview}</p>
                    ${badgesHtml ? `<div class="card-badges">${badgesHtml}</div>` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn-details" data-id="${sahabi.id}">Lire la biographie complète</button>
                </div>
            </div>
        `);

        // Event: Ouvrir le modal au clic sur la carte ou le bouton
        card.on('click', function(e) {
            e.preventDefault();
            openModal(sahabi);
        });

        return card;
    }

    /**
     * Initialiser les filtres
     */
    function initFilters() {
        $('.filter-btn').on('click', function() {
            const filter = $(this).data('filter');
            
            // Mettre à jour l'état actif
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');
            
            currentFilter = filter;
            filterSahaba(filter);
        });
    }

    /**
     * Filtrer les Sahaba
     */
    function filterSahaba(filter) {
        let filtered = allSahaba;

        if (filter === 'hommes') {
            filtered = allSahaba.filter(s => s.genre === 'homme');
        } else if (filter === 'femmes') {
            filtered = allSahaba.filter(s => s.genre === 'femme');
        } else if (filter === '10-promis') {
            filtered = allSahaba.filter(s => 
                s.categories && s.categories.some(cat => 
                    cat.toLowerCase().includes('10 promis') || 
                    cat.toLowerCase().includes('dix promis')
                )
            );
        } else if (filter === 'califes') {
            filtered = allSahaba.filter(s => 
                s.categories && s.categories.some(cat => 
                    cat.toLowerCase().includes('calife')
                )
            );
        }

        displaySahaba(filtered);
    }

    /**
     * Initialiser le modal
     */
    function initModal() {
        // Fermer le modal
        $('.close-modal').on('click', closeModal);
        
        // Fermer en cliquant en dehors
        $('.modal').on('click', function(e) {
            if ($(e.target).is('.modal')) {
                closeModal();
            }
        });

        // Fermer avec Échap
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    /**
     * Ouvrir le modal avec les détails du Sahabi
     */
    function openModal(sahabi) {
        // Remplir l'en-tête
        $('#modal-name-ar').text(sahabi.nom_arabe);
        $('#modal-name-fr').text(sahabi.nom_francais);
        $('#modal-title').text(sahabi.titre || '');
        
        let datesText = '';
        if (sahabi.date_naissance || sahabi.date_deces) {
            datesText = `${sahabi.date_naissance || '?'} - ${sahabi.date_deces || '?'}`;
        }
        $('#modal-dates').text(datesText);

        // Remplir le corps
        const modalBody = $('#modal-body');
        modalBody.empty();

        // Section Biographie
        if (sahabi.article_complet) {
            modalBody.append(`
                <div class="modal-section">
                    <h3 class="section-title">📖 Biographie</h3>
                    <div class="biography-text">${sahabi.article_complet}</div>
                </div>
            `);
        }

        // Section Contributions
        if (sahabi.contributions && Array.isArray(sahabi.contributions) && sahabi.contributions.length > 0) {
            let contributionsHtml = '<ul class="contributions-list">';
            sahabi.contributions.forEach(function(contrib) {
                contributionsHtml += `<li>${contrib}</li>`;
            });
            contributionsHtml += '</ul>';

            modalBody.append(`
                <div class="modal-section">
                    <h3 class="section-title">✨ Contributions majeures</h3>
                    ${contributionsHtml}
                </div>
            `);
        }

        // Section Vertus
        if (sahabi.vertus && Array.isArray(sahabi.vertus) && sahabi.vertus.length > 0) {
            let vertusHtml = '<div class="vertus-grid">';
            sahabi.vertus.forEach(function(vertu) {
                vertusHtml += `<div class="vertu-badge">${vertu}</div>`;
            });
            vertusHtml += '</div>';

            modalBody.append(`
                <div class="modal-section">
                    <h3 class="section-title">🌟 Vertus et qualités</h3>
                    ${vertusHtml}
                </div>
            `);
        }

        // Section Catégories
        if (sahabi.categories && Array.isArray(sahabi.categories) && sahabi.categories.length > 0) {
            let catsHtml = '<div class="categories-list">';
            sahabi.categories.forEach(function(cat) {
                catsHtml += `<span class="category-badge">${cat}</span>`;
            });
            catsHtml += '</div>';

            modalBody.append(`
                <div class="modal-section">
                    <h3 class="section-title">🏷️ Catégories</h3>
                    ${catsHtml}
                </div>
            `);
        }

        // Section Sources
        if (sahabi.sources) {
            let sourcesHtml = '<div class="references-section">';

            // Références du Coran
            if (sahabi.sources.coran && Array.isArray(sahabi.sources.coran)) {
                sahabi.sources.coran.forEach(function(ref) {
                    sourcesHtml += `
                        <div class="reference-item coran">
                            <div class="ref-header">
                                <span class="ref-location">Sourate ${ref.sourate}, Verset ${ref.verset}</span>
                            </div>
                            ${ref.texte_arabe ? `<div class="ref-arabic">${ref.texte_arabe}</div>` : ''}
                            ${ref.traduction ? `<p class="ref-translation">${ref.traduction}</p>` : ''}
                            ${ref.contexte ? `<p class="ref-context">${ref.contexte}</p>` : ''}
                        </div>
                    `;
                });
            }

            // Références de la Sunnah
            if (sahabi.sources.sunnah && Array.isArray(sahabi.sources.sunnah)) {
                sahabi.sources.sunnah.forEach(function(ref) {
                    sourcesHtml += `
                        <div class="reference-item sunnah">
                            <div class="ref-header">
                                <span class="ref-source">${ref.recueil}</span>
                                ${ref.numero ? `<span class="ref-number">N° ${ref.numero}</span>` : ''}
                            </div>
                            ${ref.texte ? `<p class="ref-text">${ref.texte}</p>` : ''}
                            ${ref.theme ? `<p class="ref-theme"><strong>Thème :</strong> ${ref.theme}</p>` : ''}
                        </div>
                    `;
                });
            }

            sourcesHtml += '</div>';

            if (sahabi.sources.coran || sahabi.sources.sunnah) {
                modalBody.append(`
                    <div class="modal-section">
                        <h3 class="section-title">📚 Sources islamiques</h3>
                        ${sourcesHtml}
                    </div>
                `);
            }

            // Bibliographie
            if (sahabi.sources.bibliographie && Array.isArray(sahabi.sources.bibliographie)) {
                let biblioHtml = '<ul class="contributions-list">';
                sahabi.sources.bibliographie.forEach(function(livre) {
                    biblioHtml += `<li>${livre}</li>`;
                });
                biblioHtml += '</ul>';

                modalBody.append(`
                    <div class="modal-section">
                        <h3 class="section-title">📕 Bibliographie</h3>
                        ${biblioHtml}
                    </div>
                `);
            }
        }

        // Afficher le modal
        $('.modal').fadeIn(300);
        $('body').css('overflow', 'hidden');
    }

    /**
     * Fermer le modal
     */
    function closeModal() {
        $('.modal').fadeOut(300);
        $('body').css('overflow', 'auto');
    }

    /**
     * Afficher un message d'erreur
     */
    function showError() {
        $('.sahaba-grid').html(`
            <div class="no-results">
                <p>❌ Erreur de chargement. Veuillez réessayer.</p>
            </div>
        `);
    }

    /**
     * Afficher un message "aucun résultat"
     */
    function showNoResults() {
        $('.sahaba-grid').html(`
            <div class="no-results">
                <p>Aucun Sahabi/Sahabiya trouvé(e) pour ce filtre.</p>
            </div>
        `);
    }

})(jQuery);

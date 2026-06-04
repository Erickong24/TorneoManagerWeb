/**
 * TorneoManager Web - SPA Router & App Logic
 */

const App = {
    pages: {
        dashboard: null,
        torneos: null,
        equipos: null,
        jugadores: null,
        fixture: null,
        proximos: null,
        reportes: null,
        sedes: null,
        arbitros: null,
        auditoria: null
    },
    
    currentPage: null,

    async init() {
        this.setupNavigation();
        
        // Handle initial route
        this.handleRoute();
        
        // Listen to hash changes for SPA navigation
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    setupNavigation() {
        // Mobile sidebar toggle
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.getElementById('sidebar');
        
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar on mobile when a link is clicked
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });
        });
    },

    async handleRoute() {
        let hash = window.location.hash || '#/dashboard';
        const pageId = hash.replace('#/', '').split('/')[0];
        
        // Validate page exists, fallback to dashboard
        if (!this.pages.hasOwnProperty(pageId)) {
            window.location.hash = '#/dashboard';
            return;
        }

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });

        // Load the page
        await this.loadPage(pageId);
    },

    async loadPage(pageId) {
        const container = document.getElementById('page-container');
        
        // Cleanup previous page if it has a cleanup method
        if (this.currentPage && this.currentPage.cleanup) {
            this.currentPage.cleanup();
        }

        // Initialize page module if it exists globally
        const PageModule = window[pageId + 'Page'];
        
        if (PageModule) {
            this.currentPage = PageModule;
            container.innerHTML = ''; // Clear container
            UI.showLoading(container);
            
            try {
                await PageModule.render(container);
            } catch (error) {
                console.error(`Error loading page ${pageId}:`, error);
                UI.showEmptyState(container, `Error cargando la página: ${error.message}`, '❌');
            }
        } else {
            container.innerHTML = `
                <div class="page-header">
                    <h1>${pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h1>
                    <p>Módulo en construcción...</p>
                </div>
            `;
        }
    }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

/**
 * TorneoManager Web - UI Components
 */

const UI = {
    /**
     * Muestra una notificación Toast
     * @param {string} message - El mensaje a mostrar
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        // Remover después de que termine la animación (3s total)
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 3000);
    },

    /**
     * Muestra un Modal
     * @param {string} title - Título del modal
     * @param {string|HTMLElement} content - Contenido HTML o elemento
     * @param {Array} buttons - Array de objetos { text, class, onClick }
     */
    showModal(title, content, buttons = []) {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');
        const closeBtn = document.getElementById('modal-close');

        if (!overlay) return;

        titleEl.textContent = title;
        
        bodyEl.innerHTML = '';
        if (typeof content === 'string') {
            bodyEl.innerHTML = content;
        } else {
            bodyEl.appendChild(content);
        }

        footerEl.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class || 'btn-ghost'}`;
            button.textContent = btn.text;
            button.onclick = (e) => {
                if (btn.onClick) {
                    // Si onClick retorna false explicitamente, no cerramos el modal
                    const result = btn.onClick(e);
                    if (result === false) return;
                }
                this.closeModal();
            };
            footerEl.appendChild(button);
        });

        // Add default cancel button if none provided and buttons array is empty
        if (buttons.length === 0) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn btn-ghost';
            closeBtn.textContent = 'Cerrar';
            closeBtn.onclick = () => this.closeModal();
            footerEl.appendChild(closeBtn);
        }

        const closeModalHandler = () => this.closeModal();
        closeBtn.onclick = closeModalHandler;
        
        // Close on overlay click (if clicking exactly on the overlay, not its children)
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeModal();
        };

        overlay.classList.add('show');
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    /**
     * Helper para formatear fechas
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', { 
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    },
    
    formatDateShort(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES');
        } catch (e) {
            return dateString;
        }
    },

    /**
     * Muestra estado de carga
     */
    showLoading(container) {
        if (typeof container === 'string') container = document.getElementById(container);
        if (container) {
            container.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><div class="spinner"></div></div>';
        }
    },

    /**
     * Muestra estado vacío
     */
    showEmptyState(container, message = 'No hay datos disponibles', icon = '📭') {
        if (typeof container === 'string') container = document.getElementById(container);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${icon}</div>
                    <div class="empty-state-text">${message}</div>
                </div>
            `;
        }
    }
};

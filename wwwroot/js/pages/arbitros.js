/**
 * Arbitros Page
 */
window.arbitrosPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1>Árbitros y Veedores</h1>
                    <p>Gestión del cuerpo arbitral del torneo</p>
                </div>
                <button class="btn btn-primary" id="btn-nuevo-arbitro">➕ Nuevo Árbitro</button>
            </div>
            
            <div class="card">
                <div class="table-wrapper" id="arbitros-table-container">
                    <!-- Table will be rendered here -->
                </div>
            </div>
        `;

        document.getElementById('btn-nuevo-arbitro').addEventListener('click', () => this.showArbitroFormModal());

        await this.loadData();
    },

    async loadData() {
        const container = document.getElementById('arbitros-table-container');
        UI.showLoading(container);

        try {
            const arbitros = await api.get('/arbitros');
            
            if (arbitros.length === 0) {
                UI.showEmptyState(container, 'No hay árbitros registrados');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Rol Predeterminado</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${arbitros.map(a => `
                            <tr>
                                <td>${a.idArbitro}</td>
                                <td style="font-weight:600">${a.nombre}</td>
                                <td><span class="badge badge-info">${a.tipo}</span></td>
                                <td><span class="badge ${a.activo === 'S' ? 'badge-success' : 'badge-danger'}">${a.activo === 'S' ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-ghost btn-edit-arbitro" data-arbitro='${JSON.stringify(a)}'>✏️ Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Event listeners
            document.querySelectorAll('.btn-edit-arbitro').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const arbitro = JSON.parse(e.currentTarget.getAttribute('data-arbitro'));
                    this.showArbitroFormModal(arbitro);
                });
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando árbitros', '❌');
            UI.toast('Error cargando árbitros', 'error');
        }
    },

    showArbitroFormModal(arbitro = null) {
        const isEdit = !!arbitro;
        const title = isEdit ? 'Editar Árbitro' : 'Nuevo Árbitro';

        const content = `
            <form id="arbitro-form">
                <input type="hidden" id="a-id" value="${arbitro?.idArbitro || 0}">
                
                <div class="form-group">
                    <label class="form-label">Nombre Completo *</label>
                    <input type="text" id="a-nombre" class="form-control" value="${arbitro?.nombre || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Rol de Arbitraje *</label>
                        <select id="a-tipo" class="form-control" required>
                            <option value="PRINCIPAL" ${arbitro?.tipo === 'PRINCIPAL' ? 'selected' : ''}>PRINCIPAL</option>
                            <option value="ASISTENTE" ${arbitro?.tipo === 'ASISTENTE' ? 'selected' : ''}>ASISTENTE</option>
                            <option value="VEEDOR" ${arbitro?.tipo === 'VEEDOR' ? 'selected' : ''}>VEEDOR</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select id="a-activo" class="form-control">
                            <option value="S" ${arbitro?.activo === 'S' ? 'selected' : ''}>ACTIVO</option>
                            <option value="N" ${arbitro?.activo === 'N' ? 'selected' : ''}>INACTIVO</option>
                        </select>
                    </div>
                </div>
            </form>
        `;

        UI.showModal(title, content, [
            { text: 'Cancelar', class: 'btn-ghost' },
            { 
                text: 'Guardar', 
                class: 'btn-primary',
                onClick: async () => {
                    const form = document.getElementById('arbitro-form');
                    if (!form.reportValidity()) return false;

                    const id = parseInt(document.getElementById('a-id').value);
                    const data = {
                        idArbitro: id,
                        nombre: document.getElementById('a-nombre').value,
                        tipo: document.getElementById('a-tipo').value,
                        activo: document.getElementById('a-activo').value
                    };

                    try {
                        if (id === 0) {
                            await api.post('/arbitros', data);
                        } else {
                            await api.put(`/arbitros/${id}`, data);
                        }
                        UI.toast('Árbitro guardado exitosamente', 'success');
                        this.loadData();
                        return true;
                    } catch (error) {
                        UI.toast(`Error al guardar: ${error.message}`, 'error');
                        return false;
                    }
                }
            }
        ]);
    }
};

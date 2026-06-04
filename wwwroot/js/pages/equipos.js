/**
 * Equipos Page
 */
window.equiposPage = {
    torneos: [],
    selectedTorneoId: null,

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Equipos</h1>
                <p>Gestión de equipos por torneo</p>
            </div>
            
            <div class="toolbar">
                <select id="select-torneo" class="toolbar-select">
                    <option value="">Cargando torneos...</option>
                </select>
                <button class="btn btn-primary" id="btn-nuevo-equipo" disabled>➕ Nuevo Equipo</button>
            </div>

            <div class="card">
                <div class="table-wrapper" id="equipos-table-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">👆</div>
                        <div class="empty-state-text">Selecciona un torneo para ver sus equipos</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-nuevo-equipo').addEventListener('click', () => this.showFormModal());
        const selectTorneo = document.getElementById('select-torneo');
        selectTorneo.addEventListener('change', (e) => {
            this.selectedTorneoId = e.target.value ? parseInt(e.target.value) : null;
            document.getElementById('btn-nuevo-equipo').disabled = !this.selectedTorneoId;
            if (this.selectedTorneoId) {
                this.loadEquipos();
            } else {
                document.getElementById('equipos-table-container').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">👆</div>
                        <div class="empty-state-text">Selecciona un torneo para ver sus equipos</div>
                    </div>
                `;
            }
        });

        await this.loadTorneos();
    },

    async loadTorneos() {
        const select = document.getElementById('select-torneo');
        try {
            this.torneos = await api.get('/torneos');
            const activos = this.torneos.filter(t => t.estado === 'ACTIVO');
            
            select.innerHTML = '<option value="">-- Seleccione un Torneo --</option>';
            activos.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.idTorneo;
                opt.textContent = t.nombre;
                select.appendChild(opt);
            });
        } catch (error) {
            UI.toast('Error cargando torneos', 'error');
            select.innerHTML = '<option value="">Error cargando</option>';
        }
    },

    async loadEquipos() {
        if (!this.selectedTorneoId) return;

        const container = document.getElementById('equipos-table-container');
        UI.showLoading(container);

        try {
            const equipos = await api.get(`/equipos/torneo/${this.selectedTorneoId}`);
            
            if (equipos.length === 0) {
                UI.showEmptyState(container, 'No hay equipos en este torneo');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Ciudad</th>
                            <th>Técnico</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${equipos.map(e => `
                            <tr>
                                <td>${e.idEquipo}</td>
                                <td style="font-weight:600">${e.nombre}</td>
                                <td>${e.ciudad || '-'}</td>
                                <td>${e.tecnico || '-'}</td>
                                <td>
                                    <span class="badge ${e.activo === 'S' ? 'badge-success' : 'badge-danger'}">
                                        ${e.activo === 'S' ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-ghost btn-edit" data-equipo='${JSON.stringify(e)}'>✏️ Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const equipo = JSON.parse(e.currentTarget.getAttribute('data-equipo'));
                    this.showFormModal(equipo);
                });
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando equipos', '❌');
            UI.toast('Error cargando equipos', 'error');
        }
    },

    showFormModal(equipo = null) {
        const isEdit = !!equipo;
        const title = isEdit ? 'Editar Equipo' : 'Nuevo Equipo';
        
        const content = `
            <form id="equipo-form">
                <input type="hidden" id="e-id" value="${equipo?.idEquipo || 0}">
                
                <div class="form-group">
                    <label class="form-label">Nombre del Equipo *</label>
                    <input type="text" id="e-nombre" class="form-control" value="${equipo?.nombre || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Ciudad</label>
                        <input type="text" id="e-ciudad" class="form-control" value="${equipo?.ciudad || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Técnico</label>
                        <input type="text" id="e-tecnico" class="form-control" value="${equipo?.tecnico || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select id="e-activo" class="form-control">
                        <option value="S" ${equipo?.activo !== 'N' ? 'selected' : ''}>ACTIVO</option>
                        <option value="N" ${equipo?.activo === 'N' ? 'selected' : ''}>INACTIVO</option>
                    </select>
                </div>
            </form>
        `;

        UI.showModal(title, content, [
            { text: 'Cancelar', class: 'btn-ghost' },
            { 
                text: 'Guardar', 
                class: 'btn-primary',
                onClick: async () => {
                    const form = document.getElementById('equipo-form');
                    if (!form.reportValidity()) return false;

                    const id = parseInt(document.getElementById('e-id').value);
                    const data = {
                        idEquipo: id,
                        idTorneo: this.selectedTorneoId,
                        nombre: document.getElementById('e-nombre').value,
                        ciudad: document.getElementById('e-ciudad').value || null,
                        tecnico: document.getElementById('e-tecnico').value || null,
                        activo: document.getElementById('e-activo').value
                    };

                    try {
                        if (id === 0) {
                            await api.post('/equipos', data);
                        } else {
                            await api.put(`/equipos/${id}`, data);
                        }
                        UI.toast('Equipo guardado exitosamente', 'success');
                        this.loadEquipos();
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

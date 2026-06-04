/**
 * Torneos Page
 */
window.torneosPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1>Torneos</h1>
                    <p>Gestión de campeonatos y ligas</p>
                </div>
                <button class="btn btn-primary" id="btn-nuevo-torneo">➕ Nuevo Torneo</button>
            </div>
            
            <div class="card">
                <div class="table-wrapper" id="torneos-table-container">
                    <!-- Table will be rendered here -->
                </div>
            </div>
        `;

        document.getElementById('btn-nuevo-torneo').addEventListener('click', () => this.showFormModal());

        await this.loadData();
    },

    async loadData() {
        const container = document.getElementById('torneos-table-container');
        UI.showLoading(container);

        try {
            const torneos = await api.get('/torneos');
            
            if (torneos.length === 0) {
                UI.showEmptyState(container, 'No hay torneos registrados');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Fechas</th>
                            <th>Cat. / Div.</th>
                            <th>Reglas (G/E/P)</th>
                            <th>Sanciones (A/R)</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${torneos.map(t => `
                            <tr>
                                <td>${t.idTorneo}</td>
                                <td style="font-weight:600">${t.nombre}</td>
                                <td>${UI.formatDateShort(t.fechaInicio)} - ${UI.formatDateShort(t.fechaFin)}</td>
                                <td>
                                    <span class="badge badge-info">${t.categoria || 'LIBRE'}</span>
                                    ${t.division ? `<span class="badge badge-muted" style="margin-left:4px">${t.division}</span>` : ''}
                                </td>
                                <td>${t.puntosVictoria}/${t.puntosEmpate}/${t.puntosDerrota}</td>
                                <td>${t.amarillasParaSuspension}/${t.rojasParaSuspension}</td>
                                <td><span class="badge ${t.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${t.estado}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-ghost btn-edit" data-torneo='${JSON.stringify(t)}'>✏️ Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Setup event listeners for edit buttons
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const torneo = JSON.parse(e.currentTarget.getAttribute('data-torneo'));
                    this.showFormModal(torneo);
                });
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando torneos', '❌');
            UI.toast('Error cargando torneos', 'error');
        }
    },

    showFormModal(torneo = null) {
        const isEdit = !!torneo;
        const title = isEdit ? 'Editar Torneo' : 'Nuevo Torneo';
        
        // Formatear fechas para input type="date"
        let fechaInicioFormatted = '';
        let fechaFinFormatted = '';
        if (torneo) {
            if (torneo.fechaInicio) fechaInicioFormatted = torneo.fechaInicio.split('T')[0];
            if (torneo.fechaFin) fechaFinFormatted = torneo.fechaFin.split('T')[0];
        }

        const content = `
            <form id="torneo-form">
                <input type="hidden" id="t-id" value="${torneo?.idTorneo || 0}">
                
                <div class="form-group">
                    <label class="form-label">Nombre del Torneo *</label>
                    <input type="text" id="t-nombre" class="form-control" value="${torneo?.nombre || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha Inicio</label>
                        <input type="date" id="t-finicio" class="form-control" value="${fechaInicioFormatted}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha Fin</label>
                        <input type="date" id="t-ffin" class="form-control" value="${fechaFinFormatted}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Categoría</label>
                        <input type="text" id="t-cat" class="form-control" value="${torneo?.categoria || 'LIBRE'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">División</label>
                        <input type="text" id="t-div" class="form-control" value="${torneo?.division || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Puntos (Victoria/Empate/Derrota)</label>
                        <div style="display:flex; gap:8px;">
                            <input type="number" id="t-pv" class="form-control" value="${torneo?.puntosVictoria ?? 3}" required>
                            <input type="number" id="t-pe" class="form-control" value="${torneo?.puntosEmpate ?? 1}" required>
                            <input type="number" id="t-pd" class="form-control" value="${torneo?.puntosDerrota ?? 0}" required>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Amarillas p/ Susp.</label>
                        <input type="number" id="t-am" class="form-control" value="${torneo?.amarillasParaSuspension ?? 3}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rojas p/ Susp.</label>
                        <input type="number" id="t-ro" class="form-control" value="${torneo?.rojasParaSuspension ?? 1}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select id="t-estado" class="form-control">
                            <option value="ACTIVO" ${torneo?.estado === 'ACTIVO' ? 'selected' : ''}>ACTIVO</option>
                            <option value="INACTIVO" ${torneo?.estado === 'INACTIVO' ? 'selected' : ''}>INACTIVO</option>
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
                    const form = document.getElementById('torneo-form');
                    if (!form.reportValidity()) return false; // Prevent closing if invalid

                    const id = parseInt(document.getElementById('t-id').value);
                    const data = {
                        idTorneo: id,
                        nombre: document.getElementById('t-nombre').value,
                        fechaInicio: document.getElementById('t-finicio').value || null,
                        fechaFin: document.getElementById('t-ffin').value || null,
                        categoria: document.getElementById('t-cat').value || 'LIBRE',
                        division: document.getElementById('t-div').value || null,
                        puntosVictoria: parseInt(document.getElementById('t-pv').value),
                        puntosEmpate: parseInt(document.getElementById('t-pe').value),
                        puntosDerrota: parseInt(document.getElementById('t-pd').value),
                        amarillasParaSuspension: parseInt(document.getElementById('t-am').value),
                        rojasParaSuspension: parseInt(document.getElementById('t-ro').value),
                        estado: document.getElementById('t-estado').value
                    };

                    try {
                        if (id === 0) {
                            await api.post('/torneos', data);
                        } else {
                            await api.put(`/torneos/${id}`, data);
                        }
                        UI.toast('Torneo guardado exitosamente', 'success');
                        this.loadData();
                        return true; // Allow modal to close
                    } catch (error) {
                        UI.toast(`Error al guardar: ${error.message}`, 'error');
                        return false; // Prevent modal close
                    }
                }
            }
        ]);
    }
};

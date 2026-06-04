/**
 * Jugadores Page
 */
window.jugadoresPage = {
    torneos: [],
    equipos: [],
    selectedTorneoId: null,
    selectedEquipoId: null,

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Jugadores</h1>
                <p>Gestión de plantillas por equipo</p>
            </div>
            
            <div class="toolbar">
                <select id="select-torneo" class="toolbar-select">
                    <option value="">Cargando torneos...</option>
                </select>
                <select id="select-equipo" class="toolbar-select" disabled>
                    <option value="">Seleccione Torneo primero</option>
                </select>
                <button class="btn btn-primary" id="btn-nuevo-jugador" disabled>➕ Nuevo Jugador</button>
            </div>

            <div class="card">
                <div class="table-wrapper" id="jugadores-table-container">
                    <div class="empty-state">
                        <div class="empty-state-icon">👆</div>
                        <div class="empty-state-text">Selecciona un equipo para ver sus jugadores</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-nuevo-jugador').addEventListener('click', () => this.showFormModal());
        
        const selectTorneo = document.getElementById('select-torneo');
        const selectEquipo = document.getElementById('select-equipo');
        
        selectTorneo.addEventListener('change', async (e) => {
            this.selectedTorneoId = e.target.value ? parseInt(e.target.value) : null;
            this.selectedEquipoId = null;
            selectEquipo.disabled = true;
            document.getElementById('btn-nuevo-jugador').disabled = true;
            
            if (this.selectedTorneoId) {
                await this.loadEquipos();
                selectEquipo.disabled = false;
            } else {
                selectEquipo.innerHTML = '<option value="">Seleccione Torneo primero</option>';
                this.clearTable();
            }
        });

        selectEquipo.addEventListener('change', (e) => {
            this.selectedEquipoId = e.target.value ? parseInt(e.target.value) : null;
            document.getElementById('btn-nuevo-jugador').disabled = !this.selectedEquipoId;
            if (this.selectedEquipoId) {
                this.loadJugadores();
            } else {
                this.clearTable();
            }
        });

        await this.loadTorneos();
    },
    
    clearTable() {
        document.getElementById('jugadores-table-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👆</div>
                <div class="empty-state-text">Selecciona un equipo para ver sus jugadores</div>
            </div>
        `;
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
        const select = document.getElementById('select-equipo');
        try {
            this.equipos = await api.get(`/equipos/torneo/${this.selectedTorneoId}`);
            const activos = this.equipos.filter(e => e.activo === 'S');
            
            select.innerHTML = '<option value="">-- Seleccione un Equipo --</option>';
            activos.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.idEquipo;
                opt.textContent = e.nombre;
                select.appendChild(opt);
            });
        } catch (error) {
            UI.toast('Error cargando equipos', 'error');
            select.innerHTML = '<option value="">Error cargando</option>';
        }
    },

    async loadJugadores() {
        if (!this.selectedEquipoId) return;

        const container = document.getElementById('jugadores-table-container');
        UI.showLoading(container);

        try {
            const jugadores = await api.get(`/jugadores/equipo/${this.selectedEquipoId}`);
            
            if (jugadores.length === 0) {
                UI.showEmptyState(container, 'No hay jugadores en este equipo');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Dorsal</th>
                            <th>Nombre Completo</th>
                            <th>Posición</th>
                            <th>Condición</th>
                            <th>Estado BD</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${jugadores.map(j => `
                            <tr>
                                <td>${j.dorsal || '-'}</td>
                                <td style="font-weight:600">${j.nombre} ${j.apellido}</td>
                                <td>${j.posicion || '-'}</td>
                                <td>
                                    <span class="badge ${j.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">
                                        ${j.estado}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${j.activo === 'S' ? 'badge-success' : 'badge-muted'}">
                                        ${j.activo === 'S' ? 'S' : 'N'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-ghost btn-edit" data-jugador='${JSON.stringify(j)}'>✏️ Editar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const jugador = JSON.parse(e.currentTarget.getAttribute('data-jugador'));
                    this.showFormModal(jugador);
                });
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando jugadores', '❌');
            UI.toast('Error cargando jugadores', 'error');
        }
    },

    showFormModal(jugador = null) {
        const isEdit = !!jugador;
        const title = isEdit ? 'Editar Jugador' : 'Nuevo Jugador';
        
        const content = `
            <form id="jugador-form">
                <input type="hidden" id="j-id" value="${jugador?.idJugador || 0}">
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nombre *</label>
                        <input type="text" id="j-nombre" class="form-control" value="${jugador?.nombre || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Apellido *</label>
                        <input type="text" id="j-apellido" class="form-control" value="${jugador?.apellido || ''}" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Posición</label>
                        <select id="j-posicion" class="form-control">
                            <option value="">No especificada</option>
                            <option value="POR" ${jugador?.posicion === 'POR' ? 'selected' : ''}>Portero</option>
                            <option value="DEF" ${jugador?.posicion === 'DEF' ? 'selected' : ''}>Defensa</option>
                            <option value="MED" ${jugador?.posicion === 'MED' ? 'selected' : ''}>Mediocampista</option>
                            <option value="DEL" ${jugador?.posicion === 'DEL' ? 'selected' : ''}>Delantero</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dorsal</label>
                        <input type="number" id="j-dorsal" class="form-control" value="${jugador?.dorsal || ''}" min="1" max="99">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Condición (Sanciones)</label>
                        <select id="j-estado" class="form-control">
                            <option value="ACTIVO" ${jugador?.estado !== 'SUSPENDIDO' ? 'selected' : ''}>ACTIVO</option>
                            <option value="SUSPENDIDO" ${jugador?.estado === 'SUSPENDIDO' ? 'selected' : ''}>SUSPENDIDO</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Activo en BD</label>
                        <select id="j-activo" class="form-control">
                            <option value="S" ${jugador?.activo !== 'N' ? 'selected' : ''}>S (Visible)</option>
                            <option value="N" ${jugador?.activo === 'N' ? 'selected' : ''}>N (Eliminado/Baja)</option>
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
                    const form = document.getElementById('jugador-form');
                    if (!form.reportValidity()) return false;

                    const id = parseInt(document.getElementById('j-id').value);
                    const dorsalVal = document.getElementById('j-dorsal').value;
                    const data = {
                        idJugador: id,
                        idEquipo: this.selectedEquipoId,
                        nombre: document.getElementById('j-nombre').value,
                        apellido: document.getElementById('j-apellido').value,
                        posicion: document.getElementById('j-posicion').value || null,
                        dorsal: dorsalVal ? parseInt(dorsalVal) : null,
                        estado: document.getElementById('j-estado').value,
                        activo: document.getElementById('j-activo').value
                    };

                    try {
                        if (id === 0) {
                            await api.post('/jugadores', data);
                        } else {
                            await api.put(`/jugadores/${id}`, data);
                        }
                        UI.toast('Jugador guardado exitosamente', 'success');
                        this.loadJugadores();
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

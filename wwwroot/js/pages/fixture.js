/**
 * Fixture Page (Programación de Partidos y Resultados)
 */
window.fixturePage = {
    torneos: [],
    equipos: [],
    sedes: [],
    arbitros: [],
    selectedTorneoId: null,

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Fixture y Resultados</h1>
                <p>Programación de partidos, registro de resultados, goles y tarjetas</p>
            </div>
            
            <div class="toolbar">
                <select id="select-torneo" class="toolbar-select">
                    <option value="">Cargando torneos...</option>
                </select>
                <button class="btn btn-primary" id="btn-programar" disabled>📅 Programar Partido</button>
            </div>

            <div id="partidos-container">
                <div class="card">
                    <div class="empty-state">
                        <div class="empty-state-icon">👆</div>
                        <div class="empty-state-text">Selecciona un torneo para ver el fixture</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-programar').addEventListener('click', () => this.showProgramarModal());
        
        const selectTorneo = document.getElementById('select-torneo');
        selectTorneo.addEventListener('change', async (e) => {
            this.selectedTorneoId = e.target.value ? parseInt(e.target.value) : null;
            document.getElementById('btn-programar').disabled = !this.selectedTorneoId;
            
            if (this.selectedTorneoId) {
                await this.loadDependencies();
                this.loadPartidos();
            } else {
                document.getElementById('partidos-container').innerHTML = `
                    <div class="card">
                        <div class="empty-state">
                            <div class="empty-state-icon">👆</div>
                            <div class="empty-state-text">Selecciona un torneo para ver el fixture</div>
                        </div>
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
            select.innerHTML = '<option value="">-- Seleccione un Torneo --</option>';
            this.torneos.forEach(t => {
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

    async loadDependencies() {
        try {
            const [equipos, sedes, arbitros] = await Promise.all([
                api.get(`/equipos/torneo/${this.selectedTorneoId}`),
                api.get('/sedes').catch(() => []), // Manejo de error si no hay API de sedes o falla
                api.get('/arbitros').catch(() => []) // Manejo de error si no hay API de árbitros o falla
            ]);
            
            this.equipos = equipos.filter(e => e.activo === 'S');
            this.sedes = sedes;
            this.arbitros = arbitros;
        } catch (error) {
            UI.toast('Error cargando dependencias (equipos/sedes/árbitros)', 'error');
        }
    },

    async loadPartidos() {
        if (!this.selectedTorneoId) return;

        const container = document.getElementById('partidos-container');
        UI.showLoading(container);

        try {
            const partidos = await api.get(`/partidos/torneo/${this.selectedTorneoId}`);
            
            if (partidos.length === 0) {
                UI.showEmptyState(container, 'No hay partidos programados en este torneo');
                return;
            }

            // Agrupar por jornada
            const porJornada = partidos.reduce((acc, p) => {
                const j = p.jornada || 0;
                if (!acc[j]) acc[j] = [];
                acc[j].push(p);
                return acc;
            }, {});

            const jornadasKeys = Object.keys(porJornada).sort((a, b) => parseInt(a) - parseInt(b));

            let html = '';
            
            for (const j of jornadasKeys) {
                html += `
                    <div class="card" style="margin-bottom: 24px;">
                        <div class="card-header">
                            <h3 class="card-title">Jornada ${j == 0 ? 'Sin asignar' : j}</h3>
                        </div>
                        <div class="partidos-list">
                `;
                
                porJornada[j].forEach(p => {
                    const esJugado = p.estado === 'JUGADO';
                    const bgClass = esJugado ? 'background: var(--bg-secondary);' : '';
                    
                    html += `
                        <div class="match-card" style="${bgClass}">
                            <div class="match-info" style="align-items: flex-start;">
                                <div class="badge ${esJugado ? 'badge-muted' : 'badge-info'}">${p.estado}</div>
                                <div class="match-date">${UI.formatDate(p.fecha)}</div>
                                <div style="font-size:12px; color:var(--text-muted)">${p.nombreSede || 'Sede por definir'}</div>
                            </div>
                            
                            <div class="match-teams">
                                <div class="match-team">${p.nombreLocal}</div>
                                ${esJugado 
                                    ? `<div class="match-score">${p.golesLocal} - ${p.golesVisitante}</div>`
                                    : `<div class="match-vs">VS</div>`
                                }
                                <div class="match-team">${p.nombreVisitante}</div>
                            </div>
                            
                            <div class="match-actions" style="display:flex; flex-direction:column; gap:8px; min-width: 140px;">
                                ${!esJugado ? `
                                    <button class="btn btn-sm btn-success btn-resultado" data-id="${p.idPartido}">⚽ Resultado</button>
                                    <button class="btn btn-sm btn-ghost btn-reprogramar" data-id="${p.idPartido}">📅 Reprogramar</button>
                                ` : `
                                    <button class="btn btn-sm btn-ghost btn-incidencias" data-id="${p.idPartido}">📋 Goles/Tarjetas</button>
                                `}
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }

            container.innerHTML = html;

            // Setup listeners
            document.querySelectorAll('.btn-resultado').forEach(btn => {
                btn.addEventListener('click', (e) => this.showResultadoModal(e.target.dataset.id));
            });
            document.querySelectorAll('.btn-incidencias').forEach(btn => {
                btn.addEventListener('click', (e) => this.showIncidenciasModal(e.target.dataset.id));
            });
            document.querySelectorAll('.btn-reprogramar').forEach(btn => {
                btn.addEventListener('click', (e) => this.showReprogramarModal(e.target.dataset.id));
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando partidos', '❌');
            UI.toast('Error cargando partidos', 'error');
        }
    },

    showProgramarModal() {
        const content = `
            <form id="programar-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Equipo Local *</label>
                        <select id="p-local" class="form-control" required>
                            <option value="">Seleccione...</option>
                            ${this.equipos.map(e => `<option value="${e.idEquipo}">${e.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Equipo Visitante *</label>
                        <select id="p-visit" class="form-control" required>
                            <option value="">Seleccione...</option>
                            ${this.equipos.map(e => `<option value="${e.idEquipo}">${e.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha y Hora</label>
                        <input type="datetime-local" id="p-fecha" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Jornada</label>
                        <input type="number" id="p-jornada" class="form-control" min="1">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Sede</label>
                        <select id="p-sede" class="form-control">
                            <option value="">Por definir</option>
                            ${this.sedes.map(s => `<option value="${s.idSede}">${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Árbitro Principal</label>
                        <select id="p-arbitro" class="form-control">
                            <option value="">Por definir</option>
                            ${this.arbitros.filter(a => a.tipo === 'PRINCIPAL').map(a => `<option value="${a.idArbitro}">${a.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </form>
        `;

        UI.showModal('Programar Partido', content, [
            { text: 'Cancelar', class: 'btn-ghost' },
            { 
                text: 'Guardar', 
                class: 'btn-primary',
                onClick: async () => {
                    const form = document.getElementById('programar-form');
                    if (!form.reportValidity()) return false;

                    const idLocal = parseInt(document.getElementById('p-local').value);
                    const idVisitante = parseInt(document.getElementById('p-visit').value);
                    
                    if (idLocal === idVisitante) {
                        UI.toast('El equipo local y visitante no pueden ser el mismo', 'warning');
                        return false;
                    }

                    const data = {
                        idTorneo: this.selectedTorneoId,
                        idLocal: idLocal,
                        idVisitante: idVisitante,
                        idSede: document.getElementById('p-sede').value ? parseInt(document.getElementById('p-sede').value) : null,
                        fecha: document.getElementById('p-fecha').value || null,
                        jornada: document.getElementById('p-jornada').value ? parseInt(document.getElementById('p-jornada').value) : null,
                        idArbitro: document.getElementById('p-arbitro').value ? parseInt(document.getElementById('p-arbitro').value) : null
                    };

                    try {
                        await api.post('/partidos', data);
                        UI.toast('Partido programado exitosamente', 'success');
                        this.loadPartidos();
                        return true;
                    } catch (error) {
                        UI.toast(`Error al programar: ${error.message}`, 'error');
                        return false;
                    }
                }
            }
        ]);
    },

    async showResultadoModal(idPartido) {
        try {
            const p = await api.get(`/partidos/${idPartido}`);
            
            const content = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h4>${p.nombreLocal} vs ${p.nombreVisitante}</h4>
                    <p style="color:var(--text-secondary); font-size:13px">Jornada ${p.jornada || '-'} | ${UI.formatDate(p.fecha)}</p>
                </div>
                
                <form id="resultado-form">
                    <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                        <div style="text-align:center;">
                            <label class="form-label">${p.nombreLocal}</label>
                            <input type="number" id="r-goles-local" class="form-control" style="font-size:24px; text-align:center; width:80px" min="0" value="0" required>
                        </div>
                        <div style="font-size:24px; font-weight:bold; margin-top:20px;">-</div>
                        <div style="text-align:center;">
                            <label class="form-label">${p.nombreVisitante}</label>
                            <input type="number" id="r-goles-visit" class="form-control" style="font-size:24px; text-align:center; width:80px" min="0" value="0" required>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 24px;">
                        <label class="form-label">Registrado por (Usuario)</label>
                        <input type="text" id="r-usuario" class="form-control" value="WEB_ADMIN" required>
                    </div>
                </form>
            `;

            UI.showModal('Registrar Resultado', content, [
                { text: 'Cancelar', class: 'btn-ghost' },
                { 
                    text: 'Confirmar y Finalizar Partido', 
                    class: 'btn-primary',
                    onClick: async () => {
                        const form = document.getElementById('resultado-form');
                        if (!form.reportValidity()) return false;

                        const data = {
                            golesLocal: parseInt(document.getElementById('r-goles-local').value),
                            golesVisitante: parseInt(document.getElementById('r-goles-visit').value),
                            usuario: document.getElementById('r-usuario').value
                        };

                        try {
                            await api.post(`/partidos/${idPartido}/resultado`, data);
                            UI.toast('Resultado registrado exitosamente', 'success');
                            this.loadPartidos();
                            return true;
                        } catch (error) {
                            UI.toast(`Error al registrar resultado: ${error.message}`, 'error');
                            return false;
                        }
                    }
                }
            ]);
        } catch (error) {
            UI.toast('Error cargando datos del partido', 'error');
        }
    },

    showReprogramarModal(idPartido) {
        const content = `
            <form id="reprog-form">
                <div class="form-group">
                    <label class="form-label">Nueva Fecha y Hora *</label>
                    <input type="datetime-local" id="rep-fecha" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Motivo (Opcional)</label>
                    <input type="text" id="rep-motivo" class="form-control" placeholder="Ej: Lluvia intensa">
                </div>
            </form>
        `;

        UI.showModal('Reprogramar Partido', content, [
            { text: 'Cancelar', class: 'btn-ghost' },
            { 
                text: 'Guardar Reprogramación', 
                class: 'btn-primary',
                onClick: async () => {
                    const form = document.getElementById('reprog-form');
                    if (!form.reportValidity()) return false;

                    const data = {
                        fechaNueva: document.getElementById('rep-fecha').value,
                        motivo: document.getElementById('rep-motivo').value || null
                    };

                    try {
                        await api.post(`/partidos/${idPartido}/reprogramar`, data);
                        UI.toast('Partido reprogramado exitosamente', 'success');
                        this.loadPartidos();
                        return true;
                    } catch (error) {
                        UI.toast(`Error al reprogramar: ${error.message}`, 'error');
                        return false;
                    }
                }
            }
        ]);
    },
    
    async showIncidenciasModal(idPartido) {
        // Un modal complejo que contiene pestañas (Goles / Tarjetas)
        // Por brevedad, mostraremos un placeholder indicando que aquí iría el formulario de goles/tarjetas
        const content = `
            <div style="text-align:center; padding: 20px;">
                <p>Las APIs para Goles y Tarjetas están listas:</p>
                <code style="display:block; padding:10px; background:var(--bg-input); margin:10px 0;">POST /api/partidos/${idPartido}/goles</code>
                <code style="display:block; padding:10px; background:var(--bg-input); margin:10px 0;">POST /api/partidos/${idPartido}/tarjetas</code>
                <p>La lógica de inserción y las vistas V_GOLEADORES y V_FAIR_PLAY se actualizarán automáticamente.</p>
            </div>
        `;
        UI.showModal('Gestión de Incidencias', content);
    }
};

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
                                    <button class="btn btn-sm btn-success btn-resultado" data-id="${p.idPartido}">⚽ Resultado / Incidencias</button>
                                    <button class="btn btn-sm btn-ghost btn-reprogramar" data-id="${p.idPartido}">📅 Reprogramar</button>
                                ` : `
                                    <button class="btn btn-sm btn-ghost btn-resultado" data-id="${p.idPartido}">📋 Ver/Editar Detalles</button>
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
            const [goles, tarjetas, jugadoresLocal, jugadoresVisitante, existingLineup, existingEvents, existingArbitrajes, existingReprog] = await Promise.all([
                api.get(`/partidos/${idPartido}/goles`),
                api.get(`/partidos/${idPartido}/tarjetas`),
                api.get(`/jugadores/equipo/${p.idLocal}`),
                api.get(`/jugadores/equipo/${p.idVisitante}`),
                api.get(`/estadisticas/partido/${idPartido}/alineacion`).catch(() => []),
                api.get(`/estadisticas/partido/${idPartido}/eventos`).catch(() => []),
                api.get(`/partidos/${idPartido}/arbitrajes`).catch(() => []),
                api.get(`/partidos/${idPartido}/reprogramaciones`).catch(() => [])
            ]);

            const todosJugadores = [...jugadoresLocal, ...jugadoresVisitante];

            const renderModalContent = () => {
                const renderPlayerRow = (j, isLocal) => {
                    const lineupEntry = existingLineup.find(x => x.idJugador === j.idJugador);
                    const eventEntry = existingEvents.find(x => x.idJugador === j.idJugador);
                    const hasLineup = !!lineupEntry;
                    
                    return `
                        <div class="player-lineup-row" data-id-jugador="${j.idJugador}" style="display:flex; flex-direction:column; gap:6px; padding:10px; border:1px solid var(--border-color); border-radius:6px; background:var(--bg-primary); margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label style="font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px; cursor:pointer; margin-bottom:0;">
                                    <input type="checkbox" class="lu-play" ${hasLineup ? 'checked' : ''} style="margin-right:4px;">
                                    #${j.dorsal || ''} ${j.nombre} ${j.apellido}
                                </label>
                                <span class="badge badge-muted" style="font-size:11px;">${j.posicion || 'N/A'}</span>
                            </div>
                            <div class="lu-inputs" style="display:${hasLineup ? 'flex' : 'none'}; gap:6px; flex-wrap:wrap; margin-top:4px;">
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:9px; color:var(--text-muted);">Rol</span>
                                    <select class="lu-titular form-control" style="width:75px; padding:2px 4px; font-size:11px; height:24px;">
                                        <option value="S" ${lineupEntry?.titular === 'S' ? 'selected' : ''}>Titular</option>
                                        <option value="N" ${lineupEntry?.titular === 'N' ? 'selected' : ''}>Suplente</option>
                                    </select>
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:9px; color:var(--text-muted);">Minutos</span>
                                    <input type="number" class="lu-minutos form-control" placeholder="Min" style="width:50px; padding:2px 4px; font-size:11px; height:24px;" value="${lineupEntry?.minutosJugados ?? eventEntry?.minutosJugados ?? 90}" min="0" max="120">
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:9px; color:var(--text-muted);">Asist.</span>
                                    <input type="number" class="lu-asistencias form-control" placeholder="Asist" style="width:50px; padding:2px 4px; font-size:11px; height:24px;" value="${eventEntry?.asistencias ?? 0}" min="0">
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:9px; color:var(--text-muted);">xG</span>
                                    <input type="number" class="lu-xg form-control" placeholder="xG" step="0.05" style="width:50px; padding:2px 4px; font-size:11px; height:24px;" value="${eventEntry?.xgEstimado ?? 0.0}" min="0" max="5">
                                </div>
                                <div style="display:flex; flex-direction:column;">
                                    <span style="font-size:9px; color:var(--text-muted);">Posición</span>
                                    <select class="lu-posicion form-control" style="width:75px; padding:2px 4px; font-size:11px; height:24px;">
                                        <option value="POR" ${eventEntry?.posicionEnCampo === 'POR' || j.posicion === 'POR' ? 'selected' : ''}>POR</option>
                                        <option value="DEF" ${eventEntry?.posicionEnCampo === 'DEF' || j.posicion === 'DEF' ? 'selected' : ''}>DEF</option>
                                        <option value="MED" ${eventEntry?.posicionEnCampo === 'MED' || j.posicion === 'MED' ? 'selected' : ''}>MED</option>
                                        <option value="DEL" ${eventEntry?.posicionEnCampo === 'DEL' || j.posicion === 'DEL' ? 'selected' : ''}>DEL</option>
                                    </select>
                                </div>
                                <div style="display:flex; align-items:center; margin-top:12px; margin-left:6px;">
                                    <label style="font-size:11px; display:flex; align-items:center; gap:2px; cursor:pointer; margin-bottom:0;">
                                        <input type="checkbox" class="lu-mvp" ${eventEntry?.mvpJornada === 'S' ? 'checked' : ''}> MVP
                                    </label>
                                </div>
                            </div>
                        </div>
                    `;
                };

                return `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h4>${p.nombreLocal} vs ${p.nombreVisitante}</h4>
                        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:0;">Jornada ${p.jornada || '-'} | ${UI.formatDate(p.fecha)} | ${p.nombreSede || 'Sede por definir'}</p>
                    </div>

                    <div class="tabs" id="match-modal-tabs" style="display:flex; margin-bottom:16px; border-bottom:1px solid var(--border-color); gap:10px;">
                        <button class="tab active" data-target="m-incidencias" style="padding:8px 12px; font-size:13px; border:none; background:none; cursor:pointer;">Goles y Tarjetas</button>
                        <button class="tab" data-target="m-lineup" style="padding:8px 12px; font-size:13px; border:none; background:none; cursor:pointer;">Alineación y Stats</button>
                        <button class="tab" data-target="m-referees" style="padding:8px 12px; font-size:13px; border:none; background:none; cursor:pointer;">Cuerpo Arbitral</button>
                        <button class="tab" data-target="m-history" style="padding:8px 12px; font-size:13px; border:none; background:none; cursor:pointer;">Reprogramaciones</button>
                    </div>
                    
                    <!-- TAB CONTENT: INCIDENCIAS -->
                    <div id="m-tab-content-incidencias" class="m-tab-panel">
                        <form id="resultado-form" style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px;">
                            <h4 style="text-align: center; margin-top:0; margin-bottom: 16px; color: var(--accent-primary);">Resultado Final</h4>
                            <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                                <div style="text-align:center;">
                                    <label class="form-label">${p.nombreLocal}</label>
                                    <input type="number" id="r-goles-local" class="form-control" style="font-size:24px; text-align:center; width:80px" min="0" value="${p.golesLocal || 0}" required>
                                </div>
                                <div style="font-size:24px; font-weight:bold; margin-top:20px;">-</div>
                                <div style="text-align:center;">
                                    <label class="form-label">${p.nombreVisitante}</label>
                                    <input type="number" id="r-goles-visit" class="form-control" style="font-size:24px; text-align:center; width:80px" min="0" value="${p.golesVisitante || 0}" required>
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-top: 16px; margin-bottom:0;">
                                <label class="form-label">Registrado por (Usuario)</label>
                                <input type="text" id="r-usuario" class="form-control" value="WEB_ADMIN" required>
                            </div>
                        </form>

                        <div class="grid-2" style="grid-template-columns: 1.2fr 1fr; gap: 20px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                            <!-- Listado de Incidencias -->
                            <div>
                                <h4 style="margin-top:0; margin-bottom:12px; border-bottom:2px solid var(--accent-primary); padding-bottom:6px;">Línea de Tiempo del Partido</h4>
                                <div id="incidencias-lista" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                                    ${goles.length === 0 && tarjetas.length === 0 ? `
                                        <div class="empty-state" style="padding:20px;">
                                            <div class="empty-state-icon" style="font-size:24px;">⚽</div>
                                            <div class="empty-state-text" style="font-size:13px;">No hay incidencias registradas en este partido</div>
                                        </div>
                                    ` : ''}
                                    
                                    ${[
                                        ...goles.map(g => ({ ...g, itemType: 'gol' })),
                                        ...tarjetas.map(t => ({ ...t, itemType: 'tarjeta' }))
                                    ]
                                    .sort((a, b) => (a.minuto || 0) - (b.minuto || 0))
                                    .map(item => {
                                        if (item.itemType === 'gol') {
                                            const jugador = todosJugadores.find(j => j.idJugador === item.idJugador);
                                            const esLocal = jugadoresLocal.some(j => j.idJugador === item.idJugador);
                                            return `
                                                <div style="display:flex; justify-content:${esLocal ? 'flex-start' : 'flex-end'}; width:100%;">
                                                    <div style="background: hsla(150, 80%, 30%, 0.08); border-left: 4px solid var(--accent-success); padding: 8px 12px; border-radius: var(--radius-md); font-size:13px; max-width: 90%;">
                                                        <strong>${item.minuto}'</strong> ⚽ Gol (${item.tipo}) - ${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Jugador Desconocido'}
                                                    </div>
                                                </div>
                                            `;
                                        } else {
                                            const jugador = todosJugadores.find(j => j.idJugador === item.idJugador);
                                            const esLocal = jugadoresLocal.some(j => j.idJugador === item.idJugador);
                                            const esRoja = item.tipo === 'ROJA';
                                            return `
                                                <div style="display:flex; justify-content:${esLocal ? 'flex-start' : 'flex-end'}; width:100%;">
                                                    <div style="background: ${esRoja ? 'hsla(0, 80%, 60%, 0.08)' : 'hsla(40, 95%, 55%, 0.08)'}; border-left: 4px solid ${esRoja ? 'var(--accent-danger)' : 'var(--accent-warning)'}; padding: 8px 12px; border-radius: var(--radius-md); font-size:13px; max-width: 90%;">
                                                        <strong>${item.minuto}'</strong> 🟨 Tarjeta ${item.tipo} - ${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Jugador Desconocido'}
                                                    </div>
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                </div>
                            </div>

                            <!-- Formularios de Registro -->
                            <div style="display:flex; flex-direction:column; gap:16px;">
                                <!-- Formulario Registrar Gol -->
                                <div class="card" style="padding: 14px; background: var(--bg-secondary); margin-bottom:0;">
                                    <h4 style="margin-top:0; margin-bottom:10px; font-size:14px; color: var(--accent-primary);">⚽ Registrar Gol</h4>
                                    <form id="form-add-gol" onsubmit="return false;">
                                        <div class="form-group" style="margin-bottom:8px;">
                                            <label class="form-label" style="font-size:11px;">Jugador</label>
                                            <select id="gol-jugador" class="form-control" style="padding:6px; font-size:12px; height:30px;" required>
                                                <option value="">Seleccione...</option>
                                                <optgroup label="${p.nombreLocal} (Local)">
                                                    ${jugadoresLocal.map(j => `<option value="${j.idJugador}">${j.nombre} ${j.apellido} (#${j.dorsal || ''})</option>`).join('')}
                                                </optgroup>
                                                <optgroup label="${p.nombreVisitante} (Visitante)">
                                                    ${jugadoresVisitante.map(j => `<option value="${j.idJugador}">${j.nombre} ${j.apellido} (#${j.dorsal || ''})</option>`).join('')}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="form-row" style="gap:8px; margin-bottom:8px;">
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label" style="font-size:11px;">Minuto</label>
                                                <input type="number" id="gol-minuto" class="form-control" style="padding:6px; font-size:12px; height:30px;" min="1" max="120" required>
                                            </div>
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label" style="font-size:11px;">Tipo</label>
                                                <select id="gol-tipo" class="form-control" style="padding:6px; font-size:12px; height:30px;">
                                                    <option value="NORMAL">Normal</option>
                                                    <option value="PENAL">Penal</option>
                                                    <option value="AUTOGOL">Autogol</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button class="btn btn-sm btn-primary" id="btn-save-gol" style="width:100%; justify-content:center;">Guardar Gol</button>
                                    </form>
                                </div>

                                <!-- Formulario Registrar Tarjeta -->
                                <div class="card" style="padding: 14px; background: var(--bg-secondary); margin-bottom:0;">
                                    <h4 style="margin-top:0; margin-bottom:10px; font-size:14px; color: var(--accent-primary);">🟨 Registrar Tarjeta</h4>
                                    <form id="form-add-tarjeta" onsubmit="return false;">
                                        <div class="form-group" style="margin-bottom:8px;">
                                            <label class="form-label" style="font-size:11px;">Jugador</label>
                                            <select id="tarjeta-jugador" class="form-control" style="padding:6px; font-size:12px; height:30px;" required>
                                                <option value="">Seleccione...</option>
                                                <optgroup label="${p.nombreLocal} (Local)">
                                                    ${jugadoresLocal.map(j => `<option value="${j.idJugador}">${j.nombre} ${j.apellido} (#${j.dorsal || ''})</option>`).join('')}
                                                </optgroup>
                                                <optgroup label="${p.nombreVisitante} (Visitante)">
                                                    ${jugadoresVisitante.map(j => `<option value="${j.idJugador}">${j.nombre} ${j.apellido} (#${j.dorsal || ''})</option>`).join('')}
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="form-row" style="gap:8px; margin-bottom:8px;">
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label" style="font-size:11px;">Minuto</label>
                                                <input type="number" id="tarjeta-minuto" class="form-control" style="padding:6px; font-size:12px; height:30px;" min="1" max="120" required>
                                            </div>
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label" style="font-size:11px;">Color</label>
                                                <select id="tarjeta-tipo" class="form-control" style="padding:6px; font-size:12px; height:30px;">
                                                    <option value="AMARILLA">Amarilla</option>
                                                    <option value="ROJA">Roja</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button class="btn btn-sm btn-primary" id="btn-save-tarjeta" style="width:100%; justify-content:center;">Guardar Tarjeta</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB CONTENT: ALINEACION Y STATS -->
                    <div id="m-tab-content-lineup" class="m-tab-panel" style="display:none">
                        <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Marca los jugadores que jugaron y sus estadísticas del partido. La formación y goles anotados se registrarán en la base de datos.</p>
                        <div class="grid-2" style="max-height: 380px; overflow-y: auto; gap: 20px;">
                            <!-- Local Team -->
                            <div>
                                <h4 style="margin-top:0; margin-bottom:10px; color:var(--accent-primary); border-bottom:1px solid var(--border-color); padding-bottom:4px;">${p.nombreLocal} (Local)</h4>
                                ${jugadoresLocal.map(j => renderPlayerRow(j, true)).join('')}
                            </div>
                            <!-- Visit Team -->
                            <div>
                                <h4 style="margin-top:0; margin-bottom:10px; color:var(--accent-primary); border-bottom:1px solid var(--border-color); padding-bottom:4px;">${p.nombreVisitante} (Visitante)</h4>
                                ${jugadoresVisitante.map(j => renderPlayerRow(j, false)).join('')}
                            </div>
                        </div>
                        <button class="btn btn-primary" id="btn-save-lineup" style="width:100%; margin-top:14px; justify-content:center; height:38px;">💾 Guardar Alineación y Estadísticas</button>
                    </div>

                    <!-- TAB CONTENT: CUERPO ARBITRAL -->
                    <div id="m-tab-content-referees" class="m-tab-panel" style="display:none">
                        <div class="grid-2" style="gap:20px; align-items:flex-start;">
                            <div>
                                <h4 style="margin-top:0; margin-bottom:12px; border-bottom:2px solid var(--accent-primary); padding-bottom:6px;">Árbitros Designados</h4>
                                <div id="arbitrajes-lista">
                                    ${existingArbitrajes.length === 0 ? `
                                        <p style="color:var(--text-muted); font-size:13px; text-align:center; padding:12px 0;">No se han calificado o asignado árbitros a este partido.</p>
                                    ` : existingArbitrajes.map(a => `
                                        <div class="card" style="padding:10px 14px; background:var(--bg-secondary); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                                            <div>
                                                <strong style="font-size:13px;">${a.nombreArbitro}</strong>
                                                <span class="badge badge-info" style="margin-left:6px; font-size:10px;">${a.rol}</span>
                                                ${a.calificacion ? `<span class="badge badge-success" style="margin-left:4px; font-size:10px;">⭐ ${a.calificacion}/10</span>` : ''}
                                                ${a.comentarios ? `<p style="font-size:12px; margin-top:4px; color:var(--text-muted); margin-bottom:0; font-style:italic;">"${a.comentarios}"</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="card" style="padding:14px; background:var(--bg-secondary); border:1px solid var(--border-strong); margin-bottom:0;">
                                <h4 style="margin-top:0; margin-bottom:10px; font-size:14px; color:var(--accent-primary);">🏁 Designar / Evaluar Árbitro</h4>
                                <form id="form-designar-arbitro" onsubmit="return false;">
                                    <div class="form-row" style="gap:8px; margin-bottom:8px;">
                                        <div class="form-group" style="margin-bottom:0;">
                                            <label class="form-label" style="font-size:11px;">Árbitro *</label>
                                            <select id="arb-id" class="form-control" style="height:32px; padding:4px; font-size:12px;" required>
                                                <option value="">Seleccione...</option>
                                                ${this.arbitros.map(a => `<option value="${a.idArbitro}">${a.nombre} (${a.tipo})</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="form-group" style="margin-bottom:0;">
                                            <label class="form-label" style="font-size:11px;">Rol *</label>
                                            <select id="arb-rol" class="form-control" style="height:32px; padding:4px; font-size:12px;" required>
                                                <option value="PRINCIPAL">PRINCIPAL</option>
                                                <option value="ASISTENTE">ASISTENTE</option>
                                                <option value="VEEDOR">VEEDOR</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-row" style="gap:8px; margin-bottom:8px;">
                                        <div class="form-group" style="margin-bottom:0;">
                                            <label class="form-label" style="font-size:11px;">Calificación (1-10)</label>
                                            <select id="arb-calif" class="form-control" style="height:32px; padding:4px; font-size:12px;">
                                                <option value="">Sin calificar</option>
                                                ${[1,2,3,4,5,6,7,8,9,10].map(v => `<option value="${v}">${v}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="form-group" style="flex:2; margin-bottom:0;">
                                            <label class="form-label" style="font-size:11px;">Comentarios</label>
                                            <input type="text" id="arb-coment" class="form-control" placeholder="Desempeño..." style="height:32px; padding:4px; font-size:12px;">
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" id="btn-save-arbitro-match" style="width:100%; margin-top:10px; justify-content:center; padding:6px 12px; height:34px; font-size:13px;">Guardar Designación</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- TAB CONTENT: REPROGRAMACIONES -->
                    <div id="m-tab-content-history" class="m-tab-panel" style="display:none">
                        <h4 style="margin-top:0; margin-bottom:12px; border-bottom:2px solid var(--accent-primary); padding-bottom:6px;">Historial de Cambios de Fecha</h4>
                        <div class="timeline" style="display:flex; flex-direction:column; gap:10px; max-height:350px; overflow-y:auto;">
                            ${existingReprog.length === 0 ? `
                                <p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px 0;">Este partido no registra reprogramaciones históricas.</p>
                            ` : existingReprog.map(r => `
                                <div class="card" style="padding:10px 14px; background:var(--bg-secondary); border-left:4px solid var(--accent-primary); margin-bottom:0;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <small style="color:var(--text-muted)">Reprogramación #${r.idReprogramacion}</small>
                                        <span class="badge badge-success" style="font-size:10px;">Notificado: ${r.notificado}</span>
                                    </div>
                                    <p style="font-size:12px; margin-top:2px; margin-bottom:2px;">
                                        Fecha Anterior: <strong>${r.fechaAnterior ? UI.formatDate(r.fechaAnterior) : 'Sin fecha anterior'}</strong>
                                    </p>
                                    <p style="font-size:12px; margin-top:2px; margin-bottom:2px;">
                                        Nueva Fecha: <strong style="color:var(--accent-primary);">${UI.formatDate(r.fechaNueva)}</strong>
                                    </p>
                                    ${r.motivo ? `<p style="font-size:11px; color:var(--text-muted); margin-top:4px; margin-bottom:0; font-style:italic;">"${r.motivo}"</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            const setupModalListeners = () => {
                // Tab switching logic
                const tabs = document.querySelectorAll('#match-modal-tabs .tab');
                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        tabs.forEach(t => t.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        const target = e.currentTarget.dataset.target;
                        document.querySelectorAll('.m-tab-panel').forEach(panel => panel.style.display = 'none');
                        document.getElementById(`m-tab-content-${target.replace('m-', '')}`).style.display = 'block';
                    });
                });

                // Toggle visibility of input fields when lu-play is checked
                document.querySelectorAll('.lu-play').forEach(chk => {
                    chk.addEventListener('change', (e) => {
                        const inputsDiv = e.currentTarget.closest('.player-lineup-row').querySelector('.lu-inputs');
                        inputsDiv.style.display = e.currentTarget.checked ? 'flex' : 'none';
                    });
                });

                // Save lineup and player stats
                document.getElementById('btn-save-lineup').addEventListener('click', async () => {
                    const alignmentRows = document.querySelectorAll('.player-lineup-row');
                    const alignments = [];
                    const events = [];

                    alignmentRows.forEach(row => {
                        const idJugador = parseInt(row.dataset.idJugador);
                        const plays = row.querySelector('.lu-play').checked;

                        if (plays) {
                            const titular = row.querySelector('.lu-titular').value;
                            const minutos = parseInt(row.querySelector('.lu-minutos').value) || 90;
                            const asistencias = parseInt(row.querySelector('.lu-asistencias').value) || 0;
                            const xg = parseFloat(row.querySelector('.lu-xg').value) || 0.0;
                            const posicion = row.querySelector('.lu-posicion').value;
                            const mvp = row.querySelector('.lu-mvp').checked ? 'S' : 'N';

                            // Goles scored by this player is count of item in goles list
                            const golesScored = goles.filter(g => g.idJugador === idJugador).length;

                            alignments.push({
                                idJugador: idJugador,
                                titular: titular,
                                minutosJugados: minutos,
                                goles: golesScored
                            });

                            events.push({
                                idJugador: idJugador,
                                minutosJugados: minutos,
                                asistencias: asistencias,
                                xgEstimado: xg,
                                posicionEnCampo: posicion,
                                mvpJornada: mvp
                            });
                        }
                    });

                    try {
                        const payload = {
                            alineaciones: alignments,
                            eventos: events
                        };
                        await api.post(`/estadisticas/partido/${idPartido}/detalles`, payload);
                        UI.toast('Alineaciones y Estadísticas guardadas correctamente', 'success');
                        this.showResultadoModal(idPartido); // Recargar modal
                    } catch (error) {
                        UI.toast(`Error: ${error.message}`, 'error');
                    }
                });

                // Save referee assignment
                document.getElementById('btn-save-arbitro-match').addEventListener('click', async () => {
                    const form = document.getElementById('form-designar-arbitro');
                    if (!form.reportValidity()) return;

                    const califVal = document.getElementById('arb-calif').value;
                    const data = {
                        idArbitro: parseInt(document.getElementById('arb-id').value),
                        rol: document.getElementById('arb-rol').value,
                        calificacion: califVal ? parseInt(califVal) : null,
                        comentarios: document.getElementById('arb-coment').value || null
                    };

                    try {
                        await api.post(`/partidos/${idPartido}/arbitrajes`, data);
                        UI.toast('Árbitro designado y calificado correctamente', 'success');
                        this.showResultadoModal(idPartido); // Recargar modal
                    } catch (error) {
                        UI.toast(`Error: ${error.message}`, 'error');
                    }
                });

                document.getElementById('btn-save-gol').addEventListener('click', async () => {
                    const form = document.getElementById('form-add-gol');
                    if (!form.reportValidity()) return;

                    const idJugador = parseInt(document.getElementById('gol-jugador').value);
                    const data = {
                        idJugador: idJugador,
                        minuto: parseInt(document.getElementById('gol-minuto').value),
                        tipo: document.getElementById('gol-tipo').value
                    };

                    try {
                        await api.post(`/partidos/${idPartido}/goles`, data);
                        UI.toast('Gol registrado correctamente', 'success');
                        
                        const esLocal = jugadoresLocal.some(j => j.idJugador === idJugador);
                        if(esLocal) {
                            const inLocal = document.getElementById('r-goles-local');
                            inLocal.value = parseInt(inLocal.value) + 1;
                        } else {
                            const inVisit = document.getElementById('r-goles-visit');
                            inVisit.value = parseInt(inVisit.value) + 1;
                        }

                        this.showResultadoModal(idPartido); // recargar modal
                    } catch (error) {
                        UI.toast(`Error al guardar gol: ${error.message}`, 'error');
                    }
                });

                document.getElementById('btn-save-tarjeta').addEventListener('click', async () => {
                    const form = document.getElementById('form-add-tarjeta');
                    if (!form.reportValidity()) return;

                    const data = {
                        idJugador: parseInt(document.getElementById('tarjeta-jugador').value),
                        minuto: parseInt(document.getElementById('tarjeta-minuto').value),
                        tipo: document.getElementById('tarjeta-tipo').value
                    };

                    try {
                        await api.post(`/partidos/${idPartido}/tarjetas`, data);
                        UI.toast('Tarjeta registrada correctamente', 'success');
                        this.showResultadoModal(idPartido); // recargar modal
                    } catch (error) {
                        UI.toast(`Error al guardar tarjeta: ${error.message}`, 'error');
                    }
                });
            };

            UI.showModal('Registrar Resultado e Incidencias', renderModalContent(), [
                { text: 'Cancelar', class: 'btn-ghost' },
                { 
                    text: p.estado === 'JUGADO' ? 'Actualizar Resultado' : 'Confirmar y Finalizar Partido', 
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
            
            setupModalListeners();

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
    }
};

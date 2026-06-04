/**
 * Reportes Page (Tabla de posiciones, Goleadores, Sancionados, Fair Play)
 */
window.reportesPage = {
    torneos: [],
    selectedTorneoId: null,

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Reportes y Estadísticas</h1>
                <p>Visualización de tablas y clasificaciones</p>
            </div>
            
            <div class="toolbar">
                <select id="select-torneo" class="toolbar-select">
                    <option value="">Cargando torneos...</option>
                </select>
            </div>

            <div class="tabs" id="reportes-tabs" style="display:none">
                <button class="tab active" data-target="posiciones">Tabla de Posiciones</button>
                <button class="tab" data-target="goleadores">Goleadores</button>
                <button class="tab" data-target="fairplay">Fair Play</button>
                <button class="tab" data-target="sancionados">Sancionados</button>
                <button class="tab" data-target="avanzadas">Estadísticas Avanzadas</button>
                <button class="tab" data-target="rachas">Rachas de Equipos</button>
            </div>

            <div class="card" id="reportes-content">
                <div class="empty-state">
                    <div class="empty-state-icon">👆</div>
                    <div class="empty-state-text">Selecciona un torneo para ver sus reportes</div>
                </div>
            </div>
        `;

        const selectTorneo = document.getElementById('select-torneo');
        selectTorneo.addEventListener('change', (e) => {
            this.selectedTorneoId = e.target.value ? parseInt(e.target.value) : null;
            if (this.selectedTorneoId) {
                document.getElementById('reportes-tabs').style.display = 'flex';
                // Trigger active tab load
                const activeTab = document.querySelector('.tab.active');
                if(activeTab) this.loadReporte(activeTab.dataset.target);
            } else {
                document.getElementById('reportes-tabs').style.display = 'none';
                document.getElementById('reportes-content').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">👆</div>
                        <div class="empty-state-text">Selecciona un torneo para ver sus reportes</div>
                    </div>
                `;
            }
        });

        // Setup tabs
        document.getElementById('reportes-tabs').addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.loadReporte(e.target.dataset.target);
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

    async loadReporte(tipo) {
        if (!this.selectedTorneoId) return;

        const container = document.getElementById('reportes-content');
        UI.showLoading(container);

        try {
            let endpoint = `/reportes/${this.selectedTorneoId}/${tipo}`;
            if (tipo === 'rachas') {
                endpoint = `/estadisticas/rachas/${this.selectedTorneoId}`;
            }
            const data = await api.get(endpoint);
            
            if (data.length === 0) {
                UI.showEmptyState(container, `No hay datos para ${tipo.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }

            let html = '<div class="table-wrapper"><table>';
            
            if (tipo === 'posiciones') {
                html += `
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Equipo</th>
                            <th title="Partidos Jugados">PJ</th>
                            <th title="Partidos Ganados">PG</th>
                            <th title="Partidos Empatados">PE</th>
                            <th title="Partidos Perdidos">PP</th>
                            <th title="Goles a Favor">GF</th>
                            <th title="Goles en Contra">GC</th>
                            <th title="Diferencia de Gol">DG</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((r, i) => `
                            <tr>
                                <td style="font-weight:bold">${i + 1}</td>
                                <td style="font-weight:600">${r.nombreEquipo}</td>
                                <td>${r.pj}</td>
                                <td>${r.pg}</td>
                                <td>${r.pe}</td>
                                <td>${r.pp}</td>
                                <td>${r.gf}</td>
                                <td>${r.gc}</td>
                                <td style="color:${r.dg > 0 ? 'var(--accent-success)' : r.dg < 0 ? 'var(--accent-danger)' : 'inherit'}">${r.dg > 0 ? '+'+r.dg : r.dg}</td>
                                <td style="font-weight:bold; font-size:16px; color:var(--accent-primary)">${r.puntos}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            } else if (tipo === 'goleadores') {
                html += `
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>Goles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="font-weight:600">${r.nombreCompleto}</td>
                                <td>${r.equipo}</td>
                                <td style="font-weight:bold; font-size:16px; color:var(--accent-primary)">${r.totalGoles}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            } else if (tipo === 'fairplay') {
                html += `
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Equipo</th>
                            <th>Amarillas (1pt)</th>
                            <th>Rojas (3pts)</th>
                            <th>Puntos Disciplina</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="font-weight:600">${r.equipo}</td>
                                <td><span class="badge badge-warning">${r.amarillas}</span></td>
                                <td><span class="badge badge-danger">${r.rojas}</span></td>
                                <td style="font-weight:bold; font-size:16px">${r.puntos}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            } else if (tipo === 'sancionados') {
                html += `
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>Motivo</th>
                            <th>Partidos Suspendidos</th>
                            <th>Partidos Cumplidos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(r => `
                            <tr>
                                <td style="font-weight:600">${r.nombreJugador}</td>
                                <td>${r.nombreEquipo}</td>
                                <td>${r.motivo}</td>
                                <td>${r.partidosSuspendidos}</td>
                                <td>${r.partidosCumplidos}</td>
                                <td>
                                    <span class="badge ${r.partidosCumplidos >= r.partidosSuspendidos ? 'badge-success' : 'badge-danger'}">
                                        ${r.partidosCumplidos >= r.partidosSuspendidos ? 'CUMPLIDA' : 'ACTIVA'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-ghost btn-apelacion" data-id="${r.idSancion}" data-nombre="${r.nombreJugador}">⚖️ Apelaciones</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            } else if (tipo === 'avanzadas') {
                html += `
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>PJ</th>
                            <th>Minutos</th>
                            <th>Asistencias</th>
                            <th>Prom. xG</th>
                            <th>MVPs</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="font-weight:600">${r.nombreCompleto}</td>
                                <td>${r.equipo}</td>
                                <td><span class="badge badge-muted">${r.partidosJugados}</span></td>
                                <td>${r.minutosTotales} min</td>
                                <td>${r.asistenciasTotales}</td>
                                <td>${r.xgPromedio.toFixed(2)}</td>
                                <td><span class="badge badge-success">${r.mvpTotales} ⭐</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            } else if (tipo === 'rachas') {
                html += `
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Partidos Invicto</th>
                            <th>Partidos Ganados</th>
                            <th>Goles a Favor</th>
                            <th>Goles en Contra</th>
                            <th>Desde Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(r => `
                            <tr>
                                <td style="font-weight:600">${r.nombre || `Equipo #${r.idEquipo}`}</td>
                                <td><span class="badge badge-success" style="font-size:13px;">${r.partidosInvicto}</span></td>
                                <td><span class="badge badge-info" style="font-size:13px;">${r.partidosGanados}</span></td>
                                <td>${r.golesFavor}</td>
                                <td>${r.golesContra}</td>
                                <td>${r.desdeFecha ? UI.formatDateShort(r.desdeFecha) : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            }

            html += '</table></div>';
            container.innerHTML = html;

            if (tipo === 'sancionados') {
                document.querySelectorAll('.btn-apelacion').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idSancion = parseInt(e.currentTarget.getAttribute('data-id'));
                        const nombre = e.currentTarget.getAttribute('data-nombre');
                        this.showApelacionesModal(idSancion, nombre);
                    });
                });
            }

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando datos del reporte', '❌');
            UI.toast('Error cargando reporte', 'error');
        }
    },

    async showApelacionesModal(idSancion, nombreJugador) {
        try {
            const apelaciones = await api.get(`/apelaciones/sancion/${idSancion}`);
            const tienePendiente = apelaciones.some(a => a.estado === 'PENDIENTE');

            const renderContent = () => {
                return `
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div>
                            <h4 style="margin-bottom:10px; border-bottom:2px solid var(--accent-primary); padding-bottom:6px;">Historial de Apelaciones</h4>
                            <div style="display:flex; flex-direction:column; gap:10px; max-height:200px; overflow-y:auto;">
                                ${apelaciones.length === 0 ? `
                                    <p style="color:var(--text-muted); font-size:13px; text-align:center;">No hay apelaciones previas para esta sanción.</p>
                                ` : apelaciones.map(a => `
                                    <div class="card" style="padding:12px; background:var(--bg-secondary);">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                            <span class="badge ${a.estado === 'APROBADA' ? 'badge-success' : a.estado === 'RECHAZADA' ? 'badge-danger' : 'badge-warning'}">
                                                ${a.estado}
                                            </span>
                                            <small style="color:var(--text-muted)">ID: ${a.idApelacion}</small>
                                        </div>
                                        <p style="font-size:13px;"><strong>Motivo:</strong> ${a.motivo || 'No especificado'}</p>
                                        ${a.respuesta ? `<p style="font-size:13px; margin-top:4px; color:var(--accent-primary)"><strong>Respuesta:</strong> ${a.respuesta}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        ${tienePendiente ? `
                            <!-- Resolver Apelación Pendiente -->
                            <div class="card" style="padding: 14px; border: 1px solid var(--border-strong);">
                                <h4 style="margin-bottom:10px; font-size:14px; color: var(--accent-primary);">⚖️ Resolver Apelación Pendiente</h4>
                                <form id="form-resolver-apelacion" onsubmit="return false;">
                                    <input type="hidden" id="ap-resolver-id" value="${apelaciones.find(a => a.estado === 'PENDIENTE').idApelacion}">
                                    <div class="form-group">
                                        <label class="form-label">Resolución *</label>
                                        <select id="ap-resolver-estado" class="form-control" required>
                                            <option value="APROBADA">APROBAR (Quita o reduce sanción)</option>
                                            <option value="RECHAZADA">RECHAZAR (Mantiene sanción)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Comentarios / Respuesta *</label>
                                        <textarea id="ap-resolver-respuesta" class="form-control" rows="2" placeholder="Ej: Se reduce la suspensión tras revisar el reporte de video..." required></textarea>
                                    </div>
                                    <button class="btn btn-sm btn-success" id="btn-resolver-apelacion" style="width:100%; justify-content:center;">Resolver Apelación</button>
                                </form>
                            </div>
                        ` : `
                            <!-- Registrar Nueva Apelación -->
                            <div class="card" style="padding: 14px; border: 1px solid var(--border-strong);">
                                <h4 style="margin-bottom:10px; font-size:14px; color: var(--accent-primary);">✍️ Presentar Nueva Apelación</h4>
                                <form id="form-nueva-apelacion" onsubmit="return false;">
                                    <div class="form-group">
                                        <label class="form-label">Motivo de la Apelación *</label>
                                        <textarea id="ap-motivo" class="form-control" rows="2" placeholder="Escribe el motivo o descargo del jugador..." required></textarea>
                                    </div>
                                    <button class="btn btn-sm btn-primary" id="btn-nueva-apelacion" style="width:100%; justify-content:center;">Enviar Apelación</button>
                                </form>
                            </div>
                        `}
                    </div>
                `;
            };

            const setupModalListeners = () => {
                const btnNueva = document.getElementById('btn-nueva-apelacion');
                if (btnNueva) {
                    btnNueva.addEventListener('click', async () => {
                        const form = document.getElementById('form-nueva-apelacion');
                        if (!form.reportValidity()) return;

                        const data = {
                            idSancion: idSancion,
                            motivo: document.getElementById('ap-motivo').value
                        };

                        try {
                            await api.post('/apelaciones', data);
                            UI.toast('Apelación registrada exitosamente', 'success');
                            this.showApelacionesModal(idSancion, nombreJugador); // recargar modal
                            this.loadReporte('sancionados'); // recargar reporte
                        } catch (error) {
                            UI.toast(`Error: ${error.message}`, 'error');
                        }
                    });
                }

                const btnResolver = document.getElementById('btn-resolver-apelacion');
                if (btnResolver) {
                    btnResolver.addEventListener('click', async () => {
                        const form = document.getElementById('form-resolver-apelacion');
                        if (!form.reportValidity()) return;

                        const idApelacion = parseInt(document.getElementById('ap-resolver-id').value);
                        const data = {
                            idApelacion: idApelacion,
                            idSancion: idSancion,
                            estado: document.getElementById('ap-resolver-estado').value,
                            respuesta: document.getElementById('ap-resolver-respuesta').value
                        };

                        try {
                            await api.put(`/apelaciones/${idApelacion}`, data);
                            UI.toast('Resolución guardada y aplicada en BD', 'success');
                            this.showApelacionesModal(idSancion, nombreJugador); // recargar modal
                            this.loadReporte('sancionados'); // recargar reporte
                        } catch (error) {
                            UI.toast(`Error: ${error.message}`, 'error');
                        }
                    });
                }
            };

            UI.showModal(`Apelaciones de Sanción - ${nombreJugador}`, renderContent(), [
                { text: 'Cerrar', class: 'btn-ghost' }
            ]);
            setupModalListeners();

        } catch (error) {
            UI.toast(`Error: ${error.message}`, 'error');
        }
    }
};

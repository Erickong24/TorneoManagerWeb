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
            const data = await api.get(`/reportes/${this.selectedTorneoId}/${tipo}`);
            
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
                            </tr>
                        `).join('')}
                    </tbody>
                `;
            }

            html += '</table></div>';
            container.innerHTML = html;

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando datos del reporte', '❌');
            UI.toast('Error cargando reporte', 'error');
        }
    }
};

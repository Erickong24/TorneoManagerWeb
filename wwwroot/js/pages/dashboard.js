/**
 * Dashboard Page
 */
window.dashboardPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Dashboard</h1>
                <p>Resumen general del sistema de torneos</p>
            </div>
            
            <div class="stats-grid" id="dashboard-stats">
                <!-- Stats loaded dynamically -->
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-info">
                        <div class="stat-value">...</div>
                        <div class="stat-label">Cargando...</div>
                    </div>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Torneos Activos</h3>
                    </div>
                    <div class="table-wrapper">
                        <table id="active-tournaments">
                            <thead>
                                <tr>
                                    <th>Torneo</th>
                                    <th>Categoría</th>
                                    <th>División</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colspan="3" style="text-align:center">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Acciones Rápidas</h3>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <a href="#/torneos" class="btn btn-primary" style="justify-content:center">Gestionar Torneos</a>
                        <a href="#/equipos" class="btn btn-ghost" style="justify-content:center">Administrar Equipos</a>
                        <a href="#/fixture" class="btn btn-ghost" style="justify-content:center">Programar Partidos</a>
                    </div>
                </div>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            // Load torneos
            const torneos = await api.get('/torneos');
            const torneosActivos = torneos.filter(t => t.estado === 'ACTIVO');
            
            // Render stats
            const statsContainer = document.getElementById('dashboard-stats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-info">
                            <div class="stat-value">${torneosActivos.length}</div>
                            <div class="stat-label">Torneos Activos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📁</div>
                        <div class="stat-info">
                            <div class="stat-value">${torneos.length}</div>
                            <div class="stat-label">Torneos Totales</div>
                        </div>
                    </div>
                `;
            }

            // Render active tournaments table
            const tbody = document.querySelector('#active-tournaments tbody');
            if (tbody) {
                if (torneosActivos.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center">No hay torneos activos</td></tr>';
                } else {
                    tbody.innerHTML = torneosActivos.slice(0, 5).map(t => `
                        <tr>
                            <td style="font-weight:600">${t.nombre}</td>
                            <td><span class="badge badge-info">${t.categoria || 'LIBRE'}</span></td>
                            <td>${t.division || '-'}</td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            UI.toast('Error cargando el dashboard', 'error');
        }
    }
};

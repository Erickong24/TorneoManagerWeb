/**
 * Auditoria Page
 */
window.auditoriaPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Auditoría de Partidos</h1>
                <p>Historial de modificaciones sobre resultados y estados de partidos</p>
            </div>
            
            <div class="card">
                <div class="table-wrapper" id="auditorias-table-container">
                    <!-- Table will be rendered here -->
                </div>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        const container = document.getElementById('auditorias-table-container');
        UI.showLoading(container);

        try {
            const auditorias = await api.get('/reportes/auditorias');
            
            if (auditorias.length === 0) {
                UI.showEmptyState(container, 'No hay registros de auditoría');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Partido</th>
                            <th>Usuario</th>
                            <th>Fecha y Hora</th>
                            <th>Estado Anterior</th>
                            <th>Estado Posterior</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${auditorias.map(a => `
                            <tr>
                                <td>${a.idAuditoria}</td>
                                <td style="font-weight:600">${a.detallePartido || `Partido #${a.idPartido}`}</td>
                                <td><span class="badge badge-muted">${a.usuario || 'Sistema'}</span></td>
                                <td>${UI.formatDate(a.fechaHora)}</td>
                                <td style="font-size:12px; color:var(--accent-danger); font-family:monospace; background:rgba(255, 107, 107, 0.05); padding:8px; border-radius:4px; max-width:300px; white-space:pre-wrap;">
                                    ${a.detalleAntes || 'Sin registros'}
                                </td>
                                <td style="font-size:12px; color:var(--accent-success); font-family:monospace; background:rgba(46, 213, 115, 0.05); padding:8px; border-radius:4px; max-width:300px; white-space:pre-wrap;">
                                    ${a.detalleDespues || 'Sin registros'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando auditorías', '❌');
            UI.toast('Error cargando auditorías', 'error');
        }
    }
};

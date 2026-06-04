/**
 * Próximos Partidos Page
 */
window.proximosPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1>Próximos Partidos</h1>
                <p>Todos los partidos programados y pendientes por jugar</p>
            </div>
            
            <div id="proximos-container">
                <!-- Se cargará dinámicamente -->
            </div>
        `;

        await this.loadProximos();
    },

    async loadProximos() {
        const container = document.getElementById('proximos-container');
        UI.showLoading(container);

        try {
            // Obtenemos todos los torneos activos
            const torneos = await api.get('/torneos');
            const torneosActivos = torneos.filter(t => t.estado === 'ACTIVO');
            
            let todosLosPartidos = [];

            // Buscamos partidos de cada torneo activo (Idealmente se haría un endpoint en el backend que retorne esto directo)
            for (const t of torneosActivos) {
                try {
                    const partidos = await api.get(`/partidos/torneo/${t.idTorneo}`);
                    // Filtrar todos los programados con fecha en el futuro (sin límite de días)
                    const now = new Date();
                    now.setHours(0, 0, 0, 0); // Desde inicio del día actual

                    const proximos = partidos.filter(p => {
                        if (p.estado !== 'PROGRAMADO' || !p.fecha) return false;
                        const pDate = new Date(p.fecha);
                        return pDate >= now; // Se muestran todos los futuros
                    }).map(p => ({ ...p, _nombreTorneo: t.nombre })); // Agregamos el nombre del torneo para mostrarlo

                    todosLosPartidos = todosLosPartidos.concat(proximos);
                } catch (err) {
                    console.error("Error obteniendo partidos del torneo", t.idTorneo);
                }
            }

            // Ordenar por fecha
            todosLosPartidos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            if (todosLosPartidos.length === 0) {
                UI.showEmptyState(container, 'No hay partidos programados pendientes', '📅');
                return;
            }

            let html = '<div class="grid-2">';
            
            todosLosPartidos.forEach(p => {
                const dateObj = new Date(p.fecha);
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                html += `
                    <div class="card" style="border-left: 4px solid var(--accent-primary)">
                        <div style="font-size: 12px; color: var(--accent-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                            ${p._nombreTorneo} - Jornada ${p.jornada || '?'}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                            <div style="font-size: 14px; font-weight: 500;">
                                <span style="text-transform: capitalize">${dayName}</span>, ${dateObj.toLocaleDateString('es-ES')}
                            </div>
                            <div class="badge badge-muted">
                                🕒 ${time}
                            </div>
                        </div>
                        
                        <div class="match-teams" style="margin-bottom: 12px;">
                            <div class="match-team" style="font-size: 16px;">${p.nombreLocal}</div>
                            <div class="match-vs">VS</div>
                            <div class="match-team" style="font-size: 16px;">${p.nombreVisitante}</div>
                        </div>
                        
                        <div style="font-size: 13px; color: var(--text-muted); text-align: center;">
                            📍 ${p.nombreSede || 'Sede por definir'}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando los próximos partidos', '❌');
        }
    }
};

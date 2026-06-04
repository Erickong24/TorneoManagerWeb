/**
 * Sedes Page (Stadiums & Bloqueos)
 */
window.sedesPage = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h1>Sedes y Estadios</h1>
                    <p>Gestión de recintos y fechas de bloqueo</p>
                </div>
                <button class="btn btn-primary" id="btn-nueva-sede">➕ Nueva Sede</button>
            </div>
            
            <div class="card">
                <div class="table-wrapper" id="sedes-table-container">
                    <!-- Table will be rendered here -->
                </div>
            </div>
        `;

        document.getElementById('btn-nueva-sede').addEventListener('click', () => this.showSedeFormModal());

        await this.loadData();
    },

    async loadData() {
        const container = document.getElementById('sedes-table-container');
        UI.showLoading(container);

        try {
            const sedes = await api.get('/sedes');
            
            if (sedes.length === 0) {
                UI.showEmptyState(container, 'No hay sedes registradas');
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Ciudad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sedes.map(s => `
                            <tr>
                                <td>${s.idSede}</td>
                                <td style="font-weight:600">${s.nombre}</td>
                                <td>${s.direccion || 'N/A'}</td>
                                <td>${s.ciudad || 'N/A'}</td>
                                <td><span class="badge ${s.activo === 'S' ? 'badge-success' : 'badge-danger'}">${s.activo === 'S' ? 'ACTIVA' : 'INACTIVA'}</span></td>
                                <td>
                                    <div style="display:flex; gap:6px;">
                                        <button class="btn btn-sm btn-ghost btn-edit-sede" data-sede='${JSON.stringify(s)}'>✏️ Editar</button>
                                        <button class="btn btn-sm btn-success btn-bloqueos-sede" data-id="${s.idSede}" data-nombre="${s.nombre}">📅 Bloqueos</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Event listeners
            document.querySelectorAll('.btn-edit-sede').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sede = JSON.parse(e.currentTarget.getAttribute('data-sede'));
                    this.showSedeFormModal(sede);
                });
            });

            document.querySelectorAll('.btn-bloqueos-sede').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idSede = parseInt(e.currentTarget.getAttribute('data-id'));
                    const nombre = e.currentTarget.getAttribute('data-nombre');
                    this.showBloqueosModal(idSede, nombre);
                });
            });

        } catch (error) {
            UI.showEmptyState(container, 'Error cargando sedes', '❌');
            UI.toast('Error cargando sedes', 'error');
        }
    },

    showSedeFormModal(sede = null) {
        const isEdit = !!sede;
        const title = isEdit ? 'Editar Sede' : 'Nueva Sede';

        const content = `
            <form id="sede-form">
                <input type="hidden" id="s-id" value="${sede?.idSede || 0}">
                
                <div class="form-group">
                    <label class="form-label">Nombre del Estadio / Sede *</label>
                    <input type="text" id="s-nombre" class="form-control" value="${sede?.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Dirección</label>
                    <input type="text" id="s-direccion" class="form-control" value="${sede?.direccion || ''}">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Ciudad</label>
                        <input type="text" id="s-ciudad" class="form-control" value="${sede?.ciudad || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select id="s-activo" class="form-control">
                            <option value="S" ${sede?.activo === 'S' ? 'selected' : ''}>ACTIVA</option>
                            <option value="N" ${sede?.activo === 'N' ? 'selected' : ''}>INACTIVA</option>
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
                    const form = document.getElementById('sede-form');
                    if (!form.reportValidity()) return false;

                    const id = parseInt(document.getElementById('s-id').value);
                    const data = {
                        idSede: id,
                        nombre: document.getElementById('s-nombre').value,
                        direccion: document.getElementById('s-direccion').value || null,
                        ciudad: document.getElementById('s-ciudad').value || null,
                        activo: document.getElementById('s-activo').value
                    };

                    try {
                        if (id === 0) {
                            await api.post('/sedes', data);
                        } else {
                            await api.put(`/sedes/${id}`, data);
                        }
                        UI.toast('Sede guardada exitosamente', 'success');
                        this.loadData();
                        return true;
                    } catch (error) {
                        UI.toast(`Error al guardar: ${error.message}`, 'error');
                        return false;
                    }
                }
            }
        ]);
    },

    async showBloqueosModal(idSede, nombreSede) {
        try {
            const loadAndRenderBloqueos = async (modalBody) => {
                const bloqueos = await api.get(`/sedes/${idSede}/bloqueos`);
                
                let bloqueosHtml = `
                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <!-- Registrar Nuevo Bloqueo -->
                        <div class="card" style="padding:14px; border:1px solid var(--border-strong); background:var(--bg-secondary);">
                            <h4 style="margin-top:0; margin-bottom:10px; font-size:14px; color:var(--accent-primary);">📅 Bloquear Nueva Fecha</h4>
                            <form id="form-nuevo-bloqueo" onsubmit="return false;" style="display:flex; gap:10px; align-items:flex-end;">
                                <div class="form-group" style="flex:1; margin-bottom:0;">
                                    <label class="form-label" style="font-size:11px;">Fecha *</label>
                                    <input type="date" id="bl-fecha" class="form-control" required style="padding:6px 10px; font-size:13px; height:38px;">
                                </div>
                                <div class="form-group" style="flex:2; margin-bottom:0;">
                                    <label class="form-label" style="font-size:11px;">Motivo</label>
                                    <input type="text" id="bl-motivo" class="form-control" placeholder="Ej: Mantenimiento de césped..." style="padding:6px 10px; font-size:13px; height:38px;">
                                </div>
                                <button class="btn btn-primary" id="btn-guardar-bloqueo" style="padding:8px 14px; height:38px;">Bloquear</button>
                            </form>
                        </div>

                        <div>
                            <h4 style="margin-top:0; margin-bottom:10px; border-bottom:2px solid var(--accent-primary); padding-bottom:6px;">Fechas Bloqueadas</h4>
                            <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;" id="bloqueos-list-container">
                                ${bloqueos.length === 0 ? `
                                    <p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px 0;">No hay fechas bloqueadas para esta sede.</p>
                                ` : bloqueos.map(b => `
                                    <div class="card" style="padding:10px 14px; display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); margin-bottom:0;">
                                        <div>
                                            <strong style="color:var(--accent-primary); font-size:14px;">${UI.formatDateShort(b.fechaBloqueada)}</strong>
                                            <p style="font-size:12px; margin-top:2px; margin-bottom:0; color:var(--text-muted);">${b.motivo || 'Sin motivo especificado'}</p>
                                        </div>
                                        <button class="btn btn-sm btn-ghost btn-delete-bloqueo" data-id="${b.idBloqueo}" style="color:var(--accent-danger); border:none; background:transparent; cursor:pointer;">🗑️</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                modalBody.innerHTML = bloqueosHtml;
                
                // Add event listeners inside the modal
                document.getElementById('btn-guardar-bloqueo').addEventListener('click', async () => {
                    const form = document.getElementById('form-nuevo-bloqueo');
                    if (!form.reportValidity()) return;

                    const data = {
                        idSede: idSede,
                        fechaBloqueada: document.getElementById('bl-fecha').value,
                        motivo: document.getElementById('bl-motivo').value || null
                    };

                    try {
                        await api.post(`/sedes/${idSede}/bloqueos`, data);
                        UI.toast('Fecha bloqueada exitosamente', 'success');
                        await loadAndRenderBloqueos(modalBody);
                    } catch (error) {
                        UI.toast(`Error: ${error.message}`, 'error');
                    }
                });

                document.querySelectorAll('.btn-delete-bloqueo').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const idBloqueo = parseInt(e.currentTarget.getAttribute('data-id'));
                        if (confirm('¿Estás seguro de que deseas eliminar este bloqueo?')) {
                            try {
                                await api.delete(`/sedes/bloqueos/${idBloqueo}`);
                                UI.toast('Bloqueo eliminado', 'success');
                                await loadAndRenderBloqueos(modalBody);
                            } catch (error) {
                                UI.toast(`Error: ${error.message}`, 'error');
                            }
                        }
                    });
                });
            };

            UI.showModal(`Gestión de Bloqueos - ${nombreSede}`, `<div id="bloqueos-modal-body">Cargando...</div>`, [
                { text: 'Cerrar', class: 'btn-ghost' }
            ]);
            
            const modalBody = document.getElementById('bloqueos-modal-body');
            await loadAndRenderBloqueos(modalBody);

        } catch (error) {
            UI.toast(`Error: ${error.message}`, 'error');
        }
    }
};

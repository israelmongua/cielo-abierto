const EVENTS_API_URL = 'http://localhost:8080/api/event';
        const ATTENDANCE_API_URL = 'http://localhost:8080/api/attendance';

        let activeMode = 'guest';
        let memberCredentials = { identifier: '', password: '' };
        let eventsCatalog = [];
        let attendancesCache = [];
        let publishedEventsCache = [];

        document.addEventListener('DOMContentLoaded', async () => {
            await loadEventsCatalog();
        });

        async function loadEventsCatalog() {
            try {
                const response = await fetch(EVENTS_API_URL);
                if (!response.ok) return;
                eventsCatalog = await response.json();
            } catch (error) {
                console.error('Error loading events catalog:', error);
            }
        }

        function selectProfileMode(mode) {
            activeMode = mode;
            const guestBtn = document.getElementById('guestModeBtn');
            const memberBtn = document.getElementById('memberModeBtn');
            const guestForm = document.getElementById('guestLookupForm');
            const memberForm = document.getElementById('memberAuthForm');

            document.getElementById('accessFeedback').innerHTML = '';
            document.getElementById('attendancesSection').style.display = 'none';
            document.getElementById('publishedEventsSection').style.display = 'none';
            cancelAttendanceEdit();

            if (mode === 'guest') {
                guestBtn.className = 'btn btn-cian-cosmos profile-toggle-btn';
                memberBtn.className = 'btn btn-borde-cosmos profile-toggle-btn';
                guestForm.style.display = 'flex';
                memberForm.style.display = 'none';
            } else {
                guestBtn.className = 'btn btn-borde-cosmos profile-toggle-btn';
                memberBtn.className = 'btn btn-cian-cosmos profile-toggle-btn';
                guestForm.style.display = 'none';
                memberForm.style.display = 'flex';
            }
        }

        document.getElementById('guestLookupForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const doc = document.getElementById('guestDocumentInput').value.trim();
            const feedbackBox = document.getElementById('accessFeedback');
            const submitBtn = document.getElementById('guestSubmitBtn');

            if (!doc) return;
            submitBtn.disabled = true;

            try {
                await loadEventsCatalog();
                const response = await fetch(`${ATTENDANCE_API_URL}/by-document/${encodeURIComponent(doc)}`);
                if (!response.ok) {
                    const errText = await response.text();
                    feedbackBox.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${errText || 'No se pudo consultar el documento.'}</div>`;
                    return;
                }

                attendancesCache = await response.json();
                document.getElementById('publishedEventsSection').style.display = 'none';
                cancelAttendanceEdit();

                feedbackBox.innerHTML = `<div class="alert alert-info py-2 small mb-0">Consulta completada para el documento <strong>${doc}</strong>. Se encontraron <strong>${attendancesCache.length}</strong> inscripción(es).</div>`;
                renderAttendancesTable(false);
            } catch (error) {
                console.error('Error querying guest attendances:', error);
                feedbackBox.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error de conexión con el servidor en el puerto 8080.</div>`;
            } finally {
                submitBtn.disabled = false;
            }
        });

        document.getElementById('memberAuthForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            memberCredentials = {
                identifier: document.getElementById('memberIdentifierInput').value.trim(),
                password: document.getElementById('memberPasswordInput').value
            };
            await loadMemberPortalData();
        });

        async function loadMemberPortalData() {
            const feedbackBox = document.getElementById('accessFeedback');
            const submitBtn = document.getElementById('memberSubmitBtn');
            const params = new URLSearchParams(memberCredentials);

            submitBtn.disabled = true;
            try {
                await loadEventsCatalog();

                const [attRes, pubRes] = await Promise.all([
                    fetch(`${ATTENDANCE_API_URL}/member/my-attendances?${params.toString()}`),
                    fetch(`${EVENTS_API_URL}/member/published-events?${params.toString()}`)
                ]);

                if (!attRes.ok) {
                    const errText = await attRes.text();
                    document.getElementById('attendancesSection').style.display = 'none';
                    document.getElementById('publishedEventsSection').style.display = 'none';
                    cancelAttendanceEdit();
                    feedbackBox.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${errText || 'Credenciales de membresía inválidas.'}</div>`;
                    return;
                }

                attendancesCache = await attRes.json();
                publishedEventsCache = pubRes.ok ? await pubRes.json() : [];

                feedbackBox.innerHTML = `<div class="alert alert-info py-2 small mb-0">Membresía verificada. Tienes <strong>${attendancesCache.length}</strong> inscripción(es) y <strong>${publishedEventsCache.length}</strong> evento(s) publicado(s).</div>`;

                renderAttendancesTable(true);
                renderPublishedEventsTable();
            } catch (error) {
                console.error('Error loading member portal data:', error);
                feedbackBox.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error de conexión con el servidor en el puerto 8080.</div>`;
            } finally {
                submitBtn.disabled = false;
            }
        }

        function findEventInfo(eventId) {
            return eventsCatalog.find((ev) => Number(ev.id) === Number(eventId)) || null;
        }

        function renderAttendancesTable(canEdit) {
            const section = document.getElementById('attendancesSection');
            const tbody = document.getElementById('attendancesTableBody');
            const actionsHeader = document.getElementById('attendanceActionsHeader');
            const modeBadge = document.getElementById('attendancesModeBadge');

            actionsHeader.style.display = canEdit ? '' : 'none';
            modeBadge.textContent = canEdit ? 'EDICIÓN HABILITADA PARA MIEMBROS' : 'SOLO LECTURA';
            section.style.display = 'block';

            const colspanCount = canEdit ? 7 : 6;
            if (!attendancesCache.length) {
                tbody.innerHTML = `<tr><td colspan="${colspanCount}" class="text-center text-secondary py-4">No hay inscripciones registradas para esta consulta.</td></tr>`;
                return;
            }

            tbody.innerHTML = attendancesCache.map((att, index) => {
                const ev = findEventInfo(att.eventId);
                const eventTitle = ev ? ev.title : `Evento #${att.eventId}`;
                const eventDate = ev && ev.startDate ? ev.startDate.replace('T', ' ').slice(0, 16) : '—';
                const statusLabel = Number(att.attendanceStatus) === 1
                    ? '<span class="text-info fw-bold">Confirmada</span>'
                    : '<span class="text-secondary">Cancelada</span>';
                const totalFormatted = `$${Number(att.price || 0).toLocaleString('es-CO')}`;

                const actionCell = canEdit
                    ? `<td><button type="button" class="btn btn-cian-cosmos btn-sm px-2 py-1 fw-bold" onclick="startAttendanceEdit(${index})">Editar</button></td>`
                    : '';

                return `
                    <tr>
                        <td class="font-monospace small">${att.code || '—'}</td>
                        <td><strong>${eventTitle}</strong><br><small class="text-secondary">${att.name || ''}</small></td>
                        <td class="small font-monospace">${eventDate}</td>
                        <td class="font-monospace">${att.personsAssistance}</td>
                        <td class="font-monospace">${totalFormatted}</td>
                        <td>${statusLabel}</td>
                        ${actionCell}
                    </tr>
                `;
            }).join('');
        }

        function startAttendanceEdit(index) {
            const att = attendancesCache[index];
            if (!att) return;

            const ev = findEventInfo(att.eventId);
            document.getElementById('editAttendanceId').value = att.id;
            document.getElementById('editAttendanceCodeDisplay').textContent = att.code || `#${att.id}`;
            document.getElementById('editAttendanceEventTitle').value = ev ? ev.title : `Evento #${att.eventId}`;
            document.getElementById('editPersonsInput').value = att.personsAssistance ?? 1;
            document.getElementById('editStatusSelect').value = att.attendanceStatus ?? 1;

            document.getElementById('editAttendanceSection').style.display = 'block';
            document.getElementById('editAttendanceSection').scrollIntoView({ behavior: 'smooth' });
        }

        function cancelAttendanceEdit() {
            document.getElementById('editAttendanceSection').style.display = 'none';
            document.getElementById('editAttendanceForm').reset();
        }

        document.getElementById('editAttendanceForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const attendanceId = document.getElementById('editAttendanceId').value;
            const personsAssistance = parseInt(document.getElementById('editPersonsInput').value, 10);
            const attendanceStatus = parseInt(document.getElementById('editStatusSelect').value, 10);
            const params = new URLSearchParams(memberCredentials);

            try {
                const response = await fetch(`${ATTENDANCE_API_URL}/member/${attendanceId}?${params.toString()}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ personsAssistance, attendanceStatus })
                });

                if (response.ok) {
                    cancelAttendanceEdit();
                    await loadMemberPortalData();
                    document.getElementById('accessFeedback').innerHTML = `<div class="alert alert-info py-2 small mb-0">Asistencia actualizada correctamente.</div>`;
                } else {
                    const errText = await response.text();
                    alert(errText || 'No se pudo actualizar la asistencia.');
                }
            } catch (error) {
                console.error('Error updating attendance:', error);
                alert('Error de conexión al guardar los cambios de asistencia.');
            }
        });

        function renderPublishedEventsTable() {
            const section = document.getElementById('publishedEventsSection');
            const tbody = document.getElementById('publishedEventsTableBody');
            section.style.display = 'block';

            if (!publishedEventsCache.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary py-4">Aún no has publicado eventos con esta membresía.</td></tr>`;
                return;
            }

            tbody.innerHTML = publishedEventsCache.map((ev) => {
                const startDateText = ev.startDate ? ev.startDate.replace('T', ' ').slice(0, 16) : '—';
                const typeLabel = ev.type === 'ASTRONOMICAL' ? 'Astronómico' : 'Divulgativo';
                const priceNum = Number(ev.ticketPrice) || 0;
                const priceText = priceNum === 0 ? 'Gratis' : `$${priceNum.toLocaleString('es-CO')}`;

                return `
                    <tr>
                        <td class="font-monospace">${ev.code ?? '—'}</td>
                        <td><strong>${ev.title}</strong><br><small class="text-secondary">${ev.location || ''}</small></td>
                        <td><span class="badge-telemetria">${typeLabel}</span></td>
                        <td class="small font-monospace">${startDateText}</td>
                        <td class="font-monospace">${ev.maximumCapacity}</td>
                        <td class="font-monospace">${priceText}</td>
                    </tr>
                `;
            }).join('');
        }
const MEMBERSHIP_MONTHLY_PRICE = 30000;

        const API = {
            events: 'http://localhost:8080/api/event',
            objects: 'http://localhost:8080/api/object',
            memberships: 'http://localhost:8080/api/membership',
            attendances: 'http://localhost:8080/api/attendance'
        };

        let store = { events: [], objects: [], memberships: [], attendances: [] };
        let feedbackTimer = null;

        function formatCOP(amount) {
            return `$${Math.round(Number(amount) || 0).toLocaleString('es-CO')}`;
        }

        function showFeedback(message, type = 'info') {
            const box = document.getElementById('adminFeedback');
            box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show py-3 px-4 small mb-0 border border-${type}" role="alert">
                <strong>${type === 'danger' ? 'Aviso:' : 'Listo:'}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>`;
            if (feedbackTimer) clearTimeout(feedbackTimer);
            feedbackTimer = setTimeout(() => {
                box.innerHTML = '';
            }, 6000);
        }

        function notifyError(message) {
            showFeedback(message, 'danger');
        }

        document.getElementById('unlockForm').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('bloqueoSection').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            syncEventObjectRequirement();
            syncMemberAttendanceFields();
            cargarTodo();
        });

        function bloquearPanel() {
            document.getElementById('unlockForm').reset();
            document.getElementById('adminContent').style.display = 'none';
            document.getElementById('bloqueoSection').style.display = 'block';
        }

        function syncEventObjectRequirement() {
            const type = document.getElementById('evType').value;
            const objInput = document.getElementById('evObjectId');
            const objLabel = document.getElementById('evObjectLabel');
            const isAstro = type === 'ASTRONOMICAL';

            objInput.placeholder = isAstro ? 'Requerido' : 'Opcional';
            objLabel.textContent = isAstro ? 'Objeto ID *' : 'Objeto ID';
        }

        function findMembershipById(id) {
            const numId = Number(id);
            if (!numId || numId <= 0) return null;
            return store.memberships.find(m => Number(m.id) === numId) || null;
        }

        function syncMemberAttendanceFields() {
            const rawMemId = document.getElementById('attMembershipId').value.trim();
            const nameInput = document.getElementById('attName');
            const idCardInput = document.getElementById('attIdCard');
            const emailInput = document.getElementById('attEmail');
            const hint = document.getElementById('attMemberHint');

            if (!rawMemId) {
                nameInput.readOnly = false;
                idCardInput.readOnly = false;
                emailInput.readOnly = false;
                hint.textContent = '';
                return;
            }

            const member = findMembershipById(rawMemId);
            if (member) {
                nameInput.value = member.name || '';
                idCardInput.value = member.idCard || '';
                emailInput.value = member.email || '';
                nameInput.readOnly = true;
                idCardInput.readOnly = true;
                emailInput.readOnly = true;
                hint.textContent = `Membresía #${member.id} vinculada: nombre, documento y correo bloqueados con los datos del miembro.`;
            } else {
                nameInput.readOnly = false;
                idCardInput.readOnly = false;
                emailInput.readOnly = false;
                hint.textContent = `No se encontró la membresía #${rawMemId} en la lista cargada (se validará al guardar).`;
            }
        }

        async function cargarTodo() {
            document.getElementById('statsStatus').textContent = 'SINCRONIZANDO...';
            try {
                const [evRes, objRes, memRes, attRes] = await Promise.all([
                    fetch(API.events),
                    fetch(API.objects),
                    fetch(API.memberships),
                    fetch(API.attendances)
                ]);

                if (evRes.ok) store.events = await evRes.json();
                if (objRes.ok) store.objects = await objRes.json();
                if (memRes.ok) store.memberships = await memRes.json();
                if (attRes.ok) store.attendances = await attRes.json();

                actualizarEstadisticas();
                renderEvents();
                renderObjects();
                renderMemberships();
                renderAttendances();
                syncMemberAttendanceFields();
                document.getElementById('statsStatus').textContent = 'ACTIVO';
            } catch (err) {
                console.error(err);
                document.getElementById('statsStatus').textContent = 'ERROR API';
                showFeedback('No se pudieron cargar los datos desde el backend.', 'danger');
            }
        }

        function actualizarEstadisticas() {
            const now = new Date();

            // 1. Tracking de entidades
            const totalEvents = store.events.length;
            const astroCount = store.events.filter(e => e.type === 'ASTRONOMICAL').length;
            const divCount = store.events.filter(e => e.type === 'DIVULGATIVE').length;

            const usedObjectIds = new Set(
                store.events.map(e => Number(e.idObject)).filter(id => id > 0)
            );

            const activeMembershipsCount = store.memberships.filter(m => {
                if (!m.endDate) return true;
                return new Date(m.endDate) >= now;
            }).length;

            const confirmedAtt = store.attendances.filter(a => Number(a.attendanceStatus) === 1);
            const cancelledAttCount = store.attendances.filter(a => Number(a.attendanceStatus) === 0).length;
            const totalSpots = confirmedAtt.reduce((acc, a) => acc + (Number(a.personsAssistance) || 0), 0);

            document.getElementById('statEvents').textContent = totalEvents;
            document.getElementById('statEventsBreakdown').textContent = `${astroCount} Astr. · ${divCount} Div.`;
            document.getElementById('statObjects').textContent = store.objects.length;
            document.getElementById('statObjectsUsed').textContent = `${usedObjectIds.size} usados en eventos`;
            document.getElementById('statMemberships').textContent = store.memberships.length;
            document.getElementById('statMembershipsActive').textContent = `${activeMembershipsCount} vigentes hoy`;
            document.getElementById('statAttendancesCount').textContent = confirmedAtt.length;
            document.getElementById('statSpotsBreakdown').textContent = `${totalSpots} cupos · ${cancelledAttCount} canceladas`;

            // 2. Finanzas
            const eventRevenue = confirmedAtt.reduce((acc, a) => acc + (Number(a.price) || 0), 0);
            const memberEventRevenue = confirmedAtt
                .filter(a => a.membershipId != null)
                .reduce((acc, a) => acc + (Number(a.price) || 0), 0);
            const guestEventRevenue = eventRevenue - memberEventRevenue;

            const membershipRevenue = store.memberships.length * MEMBERSHIP_MONTHLY_PRICE;

            const totalRevenue = eventRevenue + membershipRevenue;
            const avgTicket = totalSpots > 0 ? eventRevenue / totalSpots : 0;

            document.getElementById('statTotalRevenue').textContent = `${formatCOP(totalRevenue)} COP`;
            document.getElementById('statAvgTicket').textContent = `Ticket promedio evento: ${formatCOP(avgTicket)} COP`;
            document.getElementById('statEventRevenue').textContent = `${formatCOP(eventRevenue)} COP`;
            document.getElementById('statEventRevenueSplit').textContent =
                `Miembros: ${formatCOP(memberEventRevenue)} · Invitados: ${formatCOP(guestEventRevenue)}`;
            document.getElementById('statMembershipRevenue').textContent = `${formatCOP(membershipRevenue)} COP`;
            document.getElementById('statMembershipRevenueNote').textContent =
                `${store.memberships.length} membresías × ${formatCOP(MEMBERSHIP_MONTHLY_PRICE)}/mes`;

            // 3. Gráfica SVG Astronómicos vs Divulgativos
            renderEventsSvgChart(astroCount, divCount);

            // 4. Evento más exitoso
            renderTopEvent(confirmedAtt);

            // 5. Objetos astronómicos más usados
            renderTopObjects();
        }

        function renderEventsSvgChart(astroCount, divCount) {
            const radius = 46;
            const circumference = 2 * Math.PI * radius; // ~289.03
            const total = astroCount + divCount;

            const astroArc = document.getElementById('svgAstroArc');
            const divArc = document.getElementById('svgDivArc');
            const astroLegend = document.getElementById('legendAstroText');
            const divLegend = document.getElementById('legendDivText');
            const summaryEl = document.getElementById('chartSummaryText');

            if (total === 0) {
                astroArc.setAttribute('stroke-dasharray', `0 ${circumference.toFixed(2)}`);
                astroArc.setAttribute('stroke-dashoffset', '0');
                divArc.setAttribute('stroke-dasharray', `0 ${circumference.toFixed(2)}`);
                divArc.setAttribute('stroke-dashoffset', '0');
                astroLegend.textContent = '0 (0%)';
                divLegend.textContent = '0 (0%)';
                summaryEl.textContent = 'Sin eventos registrados todavía';
                return;
            }

            const astroRatio = astroCount / total;
            const divRatio = divCount / total;
            const astroLen = astroRatio * circumference;
            const divLen = divRatio * circumference;

            const astroPct = Math.round(astroRatio * 100);
            const divPct = 100 - astroPct;

            astroArc.setAttribute('stroke-dasharray', `${astroLen.toFixed(2)} ${circumference.toFixed(2)}`);
            astroArc.setAttribute('stroke-dashoffset', '0');

            divArc.setAttribute('stroke-dasharray', `${divLen.toFixed(2)} ${circumference.toFixed(2)}`);
            divArc.setAttribute('stroke-dashoffset', `${(-astroLen).toFixed(2)}`);

            astroLegend.textContent = `${astroCount} (${astroPct}%)`;
            divLegend.textContent = `${divCount} (${divPct}%)`;
            summaryEl.textContent = `Total: ${total} eventos · ${astroPct}% Astronómicos / ${divPct}% Divulgativos`;
        }

        function renderTopEvent(confirmedAtt) {
            const container = document.getElementById('topEventContainer');
            if (!store.events.length) {
                container.innerHTML = '<p class="text-secondary small mb-0">Sin eventos registrados.</p>';
                return;
            }

            const statsByEvent = new Map();
            store.events.forEach(ev => {
                statsByEvent.set(Number(ev.id), { event: ev, spots: 0, revenue: 0, bookings: 0 });
            });

            confirmedAtt.forEach(att => {
                const entry = statsByEvent.get(Number(att.eventId));
                if (entry) {
                    entry.spots += Number(att.personsAssistance) || 0;
                    entry.revenue += Number(att.price) || 0;
                    entry.bookings += 1;
                }
            });

            const ranked = Array.from(statsByEvent.values())
                .sort((a, b) => (b.spots - a.spots) || (b.revenue - a.revenue));

            const best = ranked[0];
            if (!best || best.spots === 0) {
                container.innerHTML = '<p class="text-secondary small mb-0">Aún no hay asistencias confirmadas en los eventos.</p>';
                return;
            }

            const capacity = Number(best.event.maximumCapacity) || 1;
            const occupancyPct = Math.min(100, Math.round((best.spots / capacity) * 100));

            container.innerHTML = `
                <div class="ranking-item">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <strong class="text-white">${best.event.title}</strong>
                        <span class="badge-telemetria">${best.event.type}</span>
                    </div>
                    <div class="small text-secondary font-monospace mb-2">
                        ID #${best.event.id} · ${best.event.location || 'Ubicación por definir'}
                    </div>
                    <div class="d-flex justify-content-between small font-monospace mb-1">
                        <span class="text-info">${best.spots} / ${capacity} cupos (${occupancyPct}%)</span>
                        <span style="color: #34d399;">${formatCOP(best.revenue)} COP</span>
                    </div>
                    <div class="progress-cosmos">
                        <div class="progress-bar-fill" style="width: ${occupancyPct}%"></div>
                    </div>
                </div>
            `;
        }

        function renderTopObjects() {
            const container = document.getElementById('topObjectsContainer');
            const counts = new Map();

            store.events.forEach(ev => {
                const objId = Number(ev.idObject);
                if (objId > 0) {
                    counts.set(objId, (counts.get(objId) || 0) + 1);
                }
            });

            if (counts.size === 0) {
                container.innerHTML = '<p class="text-secondary small mb-0">Sin objetos asociados a eventos todavía.</p>';
                return;
            }

            const sorted = Array.from(counts.entries())
                .map(([id, count]) => {
                    const obj = store.objects.find(o => Number(o.id) === id);
                    return {
                        id,
                        name: obj ? obj.name : `Objeto #${id}`,
                        code: obj ? obj.code : '—',
                        count
                    };
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 4);

            const maxCount = sorted[0].count || 1;

            container.innerHTML = sorted.map((item, idx) => {
                const pct = Math.round((item.count / maxCount) * 100);
                return `
                    <div class="ranking-item">
                        <div class="d-flex justify-content-between align-items-center small mb-1">
                            <span><strong class="text-info">#${idx + 1}</strong> <strong class="text-white">${item.name}</strong> <span class="text-secondary font-monospace">(${item.code})</span></span>
                            <span class="font-monospace text-info">${item.count} ${item.count === 1 ? 'evento' : 'eventos'}</span>
                        </div>
                        <div class="progress-cosmos">
                            <div class="progress-bar-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // --- EVENTOS ---
        function renderEvents() {
            const tbody = document.getElementById('eventsTbody');
            tbody.innerHTML = store.events.map((ev, i) => `
                <tr>
                    <td class="font-monospace">${ev.id}</td>
                    <td class="font-monospace">${ev.code ?? '—'}</td>
                    <td><strong>${ev.title}</strong></td>
                    <td><span class="badge-telemetria">${ev.type}</span></td>
                    <td class="font-monospace">$${Number(ev.ticketPrice || 0).toLocaleString('es-CO')}</td>
                    <td class="font-monospace">${ev.maximumCapacity}</td>
                    <td>
                        <button type="button" class="btn btn-borde-cosmos btn-sm py-1 px-2" onclick="editEvent(${i})">Editar</button>
                        <button type="button" class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteEntity('events', ${ev.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="7" class="text-center text-secondary">Sin eventos</td></tr>';
        }

        function editEvent(i) {
            const ev = store.events[i];
            document.getElementById('evId').value = ev.id;
            document.getElementById('evTitle').value = ev.title || '';
            document.getElementById('evType').value = ev.type || 'ASTRONOMICAL';
            document.getElementById('evCreatorId').value = ev.creatorId ?? '';
            document.getElementById('evObjectId').value = ev.idObject ?? '';
            document.getElementById('evLocation').value = ev.location || '';
            document.getElementById('evPrice').value = ev.ticketPrice ?? 0;
            document.getElementById('evCapacity').value = ev.maximumCapacity ?? 1;
            document.getElementById('evStart').value = ev.startDate ? ev.startDate.slice(0, 16) : '';
            document.getElementById('evEnd').value = ev.endDate ? ev.endDate.slice(0, 16) : '';
            document.getElementById('evImage').value = ev.eventImage || '';
            document.getElementById('evDesc').value = ev.description || '';
            syncEventObjectRequirement();
        }

        function resetEventForm() {
            document.getElementById('eventForm').reset();
            document.getElementById('evId').value = '';
            document.getElementById('evPrice').value = 0;
            syncEventObjectRequirement();
        }

        document.getElementById('eventForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('evId').value;
            const title = document.getElementById('evTitle').value.trim();
            const type = document.getElementById('evType').value;
            const creatorRaw = document.getElementById('evCreatorId').value.trim();
            const creatorVal = Number(creatorRaw);
            const objVal = document.getElementById('evObjectId').value.trim();
            const location = document.getElementById('evLocation').value.trim();
            const priceVal = Number(document.getElementById('evPrice').value);
            const capacityVal = Number(document.getElementById('evCapacity').value);
            const startVal = document.getElementById('evStart').value;
            const endVal = document.getElementById('evEnd').value;

            if (!title) return notifyError('El título del evento es obligatorio.');
            if (!creatorRaw || !Number.isInteger(creatorVal) || creatorVal <= 0) {
                return notifyError('El Creador ID debe ser un número entero mayor que cero.');
            }
            if (!store.memberships.some(m => Number(m.id) === creatorVal)) {
                return notifyError(`No existe una membresía/creador con ID #${creatorVal}.`);
            }
            if (objVal) {
                const objNum = Number(objVal);
                if (!Number.isInteger(objNum) || objNum <= 0) {
                    return notifyError('El Objeto ID debe ser un número entero mayor que cero.');
                }
                if (!store.objects.some(o => Number(o.id) === objNum)) {
                    return notifyError(`No existe un objeto astronómico con ID #${objNum}.`);
                }
            } else if (type === 'ASTRONOMICAL') {
                return notifyError('Los eventos de tipo ASTRONOMICAL requieren un Objeto ID.');
            }
            if (!location) return notifyError('La ubicación del evento es obligatoria.');
            if (!Number.isFinite(priceVal) || priceVal < 0) {
                return notifyError('El precio del ticket no puede ser negativo.');
            }
            if (!Number.isInteger(capacityVal) || capacityVal <= 0) {
                return notifyError('El cupo máximo debe ser mayor que cero.');
            }
            if (!startVal || !endVal) {
                return notifyError('Debes indicar la fecha de inicio y la fecha de fin.');
            }
            if (new Date(endVal) < new Date(startVal)) {
                return notifyError('La fecha de fin no puede ser anterior a la fecha de inicio.');
            }

            const payload = {
                title,
                type,
                creatorId: creatorVal,
                idObject: objVal ? Number(objVal) : null,
                location,
                ticketPrice: Math.trunc(priceVal),
                maximumCapacity: capacityVal,
                startDate: startVal,
                endDate: endVal,
                eventImage: document.getElementById('evImage').value.trim() || null,
                description: document.getElementById('evDesc').value.trim() || null
            };
            await saveEntity('events', id, payload, resetEventForm);
        });

        // --- OBJETOS ---
        function renderObjects() {
            const tbody = document.getElementById('objectsTbody');
            tbody.innerHTML = store.objects.map((obj, i) => `
                <tr>
                    <td class="font-monospace">${obj.id}</td>
                    <td class="font-monospace">${obj.code}</td>
                    <td><strong>${obj.name}</strong></td>
                    <td class="text-secondary small">${obj.location || '—'}</td>
                    <td>
                        <button type="button" class="btn btn-borde-cosmos btn-sm py-1 px-2" onclick="editObject(${i})">Editar</button>
                        <button type="button" class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteEntity('objects', ${obj.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="text-center text-secondary">Sin objetos</td></tr>';
        }

        function editObject(i) {
            const obj = store.objects[i];
            document.getElementById('objId').value = obj.id;
            document.getElementById('objCode').value = obj.code || '';
            document.getElementById('objName').value = obj.name || '';
            document.getElementById('objLocation').value = obj.location || '';
            document.getElementById('objImage').value = obj.image || '';
            document.getElementById('objDesc').value = obj.description || '';
        }

        function resetObjectForm() {
            document.getElementById('objectForm').reset();
            document.getElementById('objId').value = '';
        }

        document.getElementById('objectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('objId').value;
            const code = document.getElementById('objCode').value.trim();
            const name = document.getElementById('objName').value.trim();

            if (!code) return notifyError('El código del objeto astronómico es obligatorio.');
            if (!name) return notifyError('El nombre del objeto astronómico es obligatorio.');

            const payload = {
                code,
                name,
                location: document.getElementById('objLocation').value.trim() || null,
                image: document.getElementById('objImage').value.trim() || null,
                description: document.getElementById('objDesc').value.trim() || null
            };
            await saveEntity('objects', id, payload, resetObjectForm);
        });

        // --- MEMBRESÍAS ---
        function renderMemberships() {
            const tbody = document.getElementById('membershipsTbody');
            tbody.innerHTML = store.memberships.map((m, i) => `
                <tr>
                    <td class="font-monospace">${m.id}</td>
                    <td class="font-monospace">${m.code ?? '—'}</td>
                    <td><strong>${m.name}</strong></td>
                    <td class="small">${m.email}</td>
                    <td class="font-monospace">10%</td>
                    <td>
                        <button type="button" class="btn btn-borde-cosmos btn-sm py-1 px-2" onclick="editMembership(${i})">Editar</button>
                        <button type="button" class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteEntity('memberships', ${m.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="6" class="text-center text-secondary">Sin membresías</td></tr>';
        }

        function editMembership(i) {
            const m = store.memberships[i];
            document.getElementById('memId').value = m.id;
            document.getElementById('memName').value = m.name || '';
            document.getElementById('memIdCard').value = m.idCard || '';
            document.getElementById('memEmail').value = m.email || '';
            document.getElementById('memPassword').value = m.password || '';
            document.getElementById('memDiscount').value = 10;
            document.getElementById('memBirth').value = m.birthDate ? m.birthDate.slice(0, 10) : '';
            document.getElementById('memStart').value = m.startDate ? m.startDate.slice(0, 16) : '';
            document.getElementById('memEnd').value = m.endDate ? m.endDate.slice(0, 16) : '';
        }

        function resetMembershipForm() {
            document.getElementById('membershipForm').reset();
            document.getElementById('memId').value = '';
            document.getElementById('memDiscount').value = 10;
        }

        document.getElementById('membershipForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('memId').value;
            const name = document.getElementById('memName').value.trim();
            const idCard = document.getElementById('memIdCard').value.trim();
            const email = document.getElementById('memEmail').value.trim();
            const password = document.getElementById('memPassword').value;
            const birthVal = document.getElementById('memBirth').value;
            const startVal = document.getElementById('memStart').value;
            const endVal = document.getElementById('memEnd').value;

            if (!name) return notifyError('El nombre de la membresía es obligatorio.');
            if (!idCard || idCard.startsWith('-') || !/^\d+$/.test(idCard) || Number(idCard) <= 0) {
                return notifyError('El documento (idCard) debe ser un número positivo válido.');
            }
            if (!email) return notifyError('El correo electrónico es obligatorio.');
            if (!password) return notifyError('La contraseña es obligatoria.');
            if (!birthVal) return notifyError('La fecha de nacimiento es obligatoria.');
            if (!startVal || !endVal) {
                return notifyError('Debes indicar la fecha de inicio y la fecha de fin de la membresía.');
            }
            if (new Date(endVal) < new Date(startVal)) {
                return notifyError('La fecha de fin de la membresía no puede ser anterior a la fecha de inicio.');
            }

            const payload = {
                name,
                idCard,
                email,
                password,
                discount: 10,
                birthDate: birthVal,
                startDate: startVal,
                endDate: endVal
            };
            await saveEntity('memberships', id, payload, resetMembershipForm);
        });

        // --- ASISTENCIAS ---
        function renderAttendances() {
            const tbody = document.getElementById('attendancesTbody');
            tbody.innerHTML = store.attendances.map((a, i) => `
                <tr>
                    <td class="font-monospace">${a.id}</td>
                    <td class="font-monospace">${a.code ?? '—'}</td>
                    <td class="font-monospace">Ev #${a.eventId}</td>
                    <td>${a.name || 'Invitado'}</td>
                    <td class="font-monospace">${a.personsAssistance}</td>
                    <td class="font-monospace">$${Number(a.price || 0).toLocaleString('es-CO')}</td>
                    <td>${a.attendanceStatus == 1 ? '<span class="text-info">Confirmada</span>' : '<span class="text-secondary">Cancelada</span>'}</td>
                    <td>
                        <button type="button" class="btn btn-borde-cosmos btn-sm py-1 px-2" onclick="editAttendance(${i})">Editar</button>
                        <button type="button" class="btn btn-outline-danger btn-sm py-1 px-2" onclick="deleteEntity('attendances', ${a.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="8" class="text-center text-secondary">Sin asistencias</td></tr>';
        }

        function editAttendance(i) {
            const a = store.attendances[i];
            document.getElementById('attId').value = a.id;
            document.getElementById('attEventId').value = a.eventId ?? '';
            document.getElementById('attMembershipId').value = a.membershipId ?? '';
            document.getElementById('attName').value = a.name || '';
            document.getElementById('attIdCard').value = a.idCard || '';
            document.getElementById('attEmail').value = a.email || '';
            document.getElementById('attPersons').value = a.personsAssistance ?? 1;
            document.getElementById('attPrice').value = a.price ?? 0;
            document.getElementById('attStatus').value = a.attendanceStatus ?? 1;
            syncMemberAttendanceFields();
        }

        function resetAttendanceForm() {
            document.getElementById('attendanceForm').reset();
            document.getElementById('attId').value = '';
            document.getElementById('attPersons').value = 1;
            document.getElementById('attPrice').value = 0;
            document.getElementById('attStatus').value = 1;
            syncMemberAttendanceFields();
        }

        document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('attId').value;
            const eventRaw = document.getElementById('attEventId').value.trim();
            const eventVal = Number(eventRaw);
            const memRaw = document.getElementById('attMembershipId').value.trim();
            const personsVal = Number(document.getElementById('attPersons').value);
            const priceVal = Number(document.getElementById('attPrice').value);

            if (!eventRaw || !Number.isInteger(eventVal) || eventVal <= 0) {
                return notifyError('El Evento ID debe ser un número entero mayor que cero.');
            }
            if (!store.events.some(ev => Number(ev.id) === eventVal)) {
                return notifyError(`No existe un evento con ID #${eventVal}.`);
            }

            let membershipId = null;
            let name = document.getElementById('attName').value.trim();
            let idCard = document.getElementById('attIdCard').value.trim();
            let email = document.getElementById('attEmail').value.trim() || null;

            if (memRaw) {
                const memNum = Number(memRaw);
                if (!Number.isInteger(memNum) || memNum <= 0) {
                    return notifyError('La Membresía ID debe ser un número entero mayor que cero.');
                }
                const member = findMembershipById(memNum);
                if (!member) {
                    return notifyError(`No existe una membresía con ID #${memNum}.`);
                }
                membershipId = memNum;
                name = member.name;
                idCard = member.idCard;
                email = member.email || null;
            } else {
                if (!name) return notifyError('El nombre del asistente es obligatorio.');
                if (!idCard) return notifyError('El documento del asistente es obligatorio.');
            }

            if (!Number.isInteger(personsVal) || personsVal <= 0) {
                return notifyError('La cantidad de cupos debe ser mayor que cero.');
            }
            if (!Number.isFinite(priceVal) || priceVal < 0) {
                return notifyError('El precio no puede ser negativo.');
            }

            const payload = {
                eventId: eventVal,
                membershipId,
                name,
                idCard,
                email,
                personsAssistance: personsVal,
                price: Math.trunc(priceVal),
                attendanceStatus: Number(document.getElementById('attStatus').value)
            };
            await saveEntity('attendances', id, payload, resetAttendanceForm);
        });

        // --- HELPERS CRUD ---
        async function saveEntity(key, id, payload, resetFn) {
            const url = id ? `${API[key]}/${id}` : API[key];
            const method = id ? 'PUT' : 'POST';
            if (id) payload.id = Number(id);

            try {
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    resetFn();
                    await cargarTodo();
                    showFeedback(id ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.', 'info');
                } else {
                    const txt = await res.text();
                    notifyError(txt || `Error al guardar (HTTP ${res.status}).`);
                }
            } catch (err) {
                console.error(err);
                notifyError('Error de conexión con el servidor.');
            }
        }

        async function deleteEntity(key, id) {
            const fkHints = {
                objects: 'No se puede eliminar este objeto astronómico porque está asociado a uno o más eventos. Elimina o edita esos eventos primero.',
                memberships: 'No se puede eliminar esta membresía porque tiene eventos creados o asistencias registradas. Elimina primero sus asistencias y eventos.',
                events: 'No se puede eliminar este evento porque tiene asistencias registradas. Elimina primero las asistencias de este evento.',
                attendances: 'No se pudo eliminar la asistencia.'
            };

            try {
                const res = await fetch(`${API[key]}/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    await cargarTodo();
                    showFeedback('Registro eliminado correctamente.', 'info');
                } else {
                    const raw = await res.text();
                    console.error(`DELETE ${API[key]}/${id} -> HTTP ${res.status}:`, raw);
                    if (res.status === 500 || res.status === 409) {
                        notifyError(fkHints[key] || `No se puede eliminar por restricción de datos relacionados (HTTP ${res.status}).`);
                    } else if (res.status === 404) {
                        notifyError(`El registro #${id} ya no existe en el servidor.`);
                        await cargarTodo();
                    } else {
                        notifyError(raw || `No se pudo eliminar el registro (HTTP ${res.status}).`);
                    }
                }
            } catch (err) {
                console.error(err);
                notifyError('Error de conexión al eliminar (verifica que Spring Boot esté corriendo y permita DELETE en CORS).');
            }
        }
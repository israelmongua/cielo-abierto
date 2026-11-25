const EVENTS_API_URL = 'http://localhost:8080/api/event';
        const ATTENDANCE_API_URL = 'http://localhost:8080/api/attendance';

        let eventsCache = [];
        let selectedEvent = null;
        let attendeeType = 'non-member';
        let verifiedMember = null;
        let isProcessingPayment = false;

        document.addEventListener('DOMContentLoaded', async () => {
            await loadEvents();
            const prefilledCode = new URLSearchParams(window.location.search).get('code');
            if (prefilledCode) {
                document.getElementById('eventCodeInput').value = prefilledCode;
                lookupEventByCode();
            }
            updatePricingSummary();
        });

        async function loadEvents() {
            try {
                const response = await fetch(EVENTS_API_URL);
                if (!response.ok) return;
                eventsCache = await response.json();
            } catch (error) {
                console.error('Error loading events:', error);
            }
        }

        function formatCOP(value) {
            return `$${Math.round(Number(value) || 0).toLocaleString('es-CO')} COP`;
        }

        function lookupEventByCode() {
            const codeInput = document.getElementById('eventCodeInput').value.trim();
            const previewBox = document.getElementById('eventPreviewBox');
            const messageBox = document.getElementById('eventLookupMessage');

            if (!codeInput) {
                selectedEvent = null;
                previewBox.style.display = 'none';
                messageBox.innerHTML = '';
                updatePricingSummary();
                return;
            }

            const matched = eventsCache.find((ev) => String(ev.code).trim().toLowerCase() === codeInput.toLowerCase());
            if (!matched) {
                selectedEvent = null;
                previewBox.style.display = 'none';
                messageBox.innerHTML = `<div class="text-warning small font-monospace">No se encontró un evento con el código "${codeInput}".</div>`;
                updatePricingSummary();
                return;
            }

            selectedEvent = matched;
            messageBox.innerHTML = '';
            const startText = matched.startDate ? matched.startDate.replace('T', ' ').slice(0, 16) : 'Por definir';
            const basePrice = Number(matched.ticketPrice) || 0;

            previewBox.style.display = 'block';
            previewBox.innerHTML = `
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                        <span class="badge-telemetria mb-1">${matched.type || 'EVENTO'}</span>
                        <h2 class="h5 text-white fw-bold mb-1">${matched.title}</h2>
                        <div class="small text-secondary">📍 ${matched.location || 'Ubicación por confirmar'} · 📅 ${startText}</div>
                    </div>
                    <div class="text-end font-monospace">
                        <div class="text-info fw-bold">${basePrice === 0 ? 'Gratuito' : formatCOP(basePrice)}</div>
                        <div class="small text-secondary">Cupo máx.: ${matched.maximumCapacity}</div>
                    </div>
                </div>
            `;
            updatePricingSummary();
        }

        function setAttendeeType(type) {
            attendeeType = type;
            const nonMemberBtn = document.getElementById('nonMemberBtn');
            const memberBtn = document.getElementById('memberBtn');
            const memberCredsBlock = document.getElementById('memberCredentialsBlock');

            document.getElementById('memberAuthMessage').innerHTML = '';

            if (type === 'non-member') {
                nonMemberBtn.className = 'btn btn-cian-cosmos mode-btn';
                memberBtn.className = 'btn btn-borde-cosmos mode-btn';
                memberCredsBlock.style.display = 'none';
                verifiedMember = null;
                setPersonalFieldsReadonly(false);
                clearPersonalFields();
            } else {
                nonMemberBtn.className = 'btn btn-borde-cosmos mode-btn';
                memberBtn.className = 'btn btn-cian-cosmos mode-btn';
                memberCredsBlock.style.display = 'block';
                verifiedMember = null;
                setPersonalFieldsReadonly(true);
                clearPersonalFields();
            }
            updatePricingSummary();
        }

        function setPersonalFieldsReadonly(readonly) {
            document.getElementById('attendeeNameInput').readOnly = readonly;
            document.getElementById('attendeeDocumentInput').readOnly = readonly;
            document.getElementById('attendeeEmailInput').readOnly = readonly;
            document.getElementById('attendeeBirthDateInput').readOnly = readonly;
        }

        function clearPersonalFields() {
            document.getElementById('attendeeNameInput').value = '';
            document.getElementById('attendeeDocumentInput').value = '';
            document.getElementById('attendeeEmailInput').value = '';
            document.getElementById('attendeeBirthDateInput').value = '';
        }

        async function verifyMember() {
            const identifier = document.getElementById('memberIdentifierInput').value.trim();
            const password = document.getElementById('memberPasswordInput').value;
            const authMsg = document.getElementById('memberAuthMessage');

            if (!identifier || !password) {
                authMsg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Ingresa tu correo o documento y tu contraseña.</div>`;
                return;
            }

            const params = new URLSearchParams({ identifier, password });
            try {
                const response = await fetch(`${ATTENDANCE_API_URL}/member-profile?${params.toString()}`);
                if (!response.ok) {
                    const errText = await response.text();
                    verifiedMember = null;
                    authMsg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">${errText || 'No se pudo verificar la membresía.'}</div>`;
                    updatePricingSummary();
                    return;
                }

                verifiedMember = await response.json();
                document.getElementById('attendeeNameInput').value = verifiedMember.name || '';
                document.getElementById('attendeeDocumentInput').value = verifiedMember.idCard || '';
                document.getElementById('attendeeEmailInput').value = verifiedMember.email || '';
                document.getElementById('attendeeBirthDateInput').value = verifiedMember.birthDate ? verifiedMember.birthDate.slice(0, 10) : '';

                const discount = verifiedMember.discount != null ? verifiedMember.discount : 10;
                authMsg.innerHTML = `<div class="alert alert-info py-2 small mb-0">Membresía verificada para <strong>${verifiedMember.name}</strong> (${discount}% de descuento aplicado).</div>`;
                updatePricingSummary();
            } catch (error) {
                console.error('Error verifying member:', error);
                authMsg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error de conexión con el servidor en el puerto 8080.</div>`;
            }
        }

        function calculateTotalAmount() {
            const quantity = Math.max(1, parseInt(document.getElementById('ticketQuantityInput').value, 10) || 1);
            const basePrice = selectedEvent ? Math.max(0, Number(selectedEvent.ticketPrice) || 0) : 0;
            const discountPercent = (attendeeType === 'member' && verifiedMember)
                ? (verifiedMember.discount != null ? Number(verifiedMember.discount) : 10)
                : 0;

            const discountedUnitPrice = Math.max(0, Math.round(basePrice * (100 - discountPercent) / 100));
            const totalPrice = discountedUnitPrice * quantity;

            return { basePrice, discountPercent, discountedUnitPrice, quantity, totalPrice };
        }

        function updatePricingSummary() {
            const { basePrice, discountPercent, quantity, totalPrice } = calculateTotalAmount();
            document.getElementById('summaryUnitPrice').textContent = basePrice === 0 ? 'Gratuito' : formatCOP(basePrice);
            document.getElementById('summaryDiscount').textContent = `${discountPercent}%`;
            document.getElementById('summaryQuantity').textContent = String(quantity);
            document.getElementById('summaryTotalPrice').textContent = totalPrice === 0 ? 'Gratuito ($0 COP)' : formatCOP(totalPrice);
        }

        function validateRegistrationForm() {
            const feedbackBox = document.getElementById('registrationFeedback');
            const name = document.getElementById('attendeeNameInput').value.trim();
            const idCard = document.getElementById('attendeeDocumentInput').value.trim();
            const quantity = parseInt(document.getElementById('ticketQuantityInput').value, 10);

            if (!selectedEvent) {
                feedbackBox.innerHTML = `<div class="alert alert-danger mb-0">Ingresa un código de evento válido antes de pagar.</div>`;
                return false;
            }
            if (attendeeType === 'member' && !verifiedMember) {
                feedbackBox.innerHTML = `<div class="alert alert-danger mb-0">Verifica primero tus credenciales de miembro para cargar tus datos.</div>`;
                return false;
            }
            if (!name || !idCard) {
                feedbackBox.innerHTML = `<div class="alert alert-danger mb-0">El nombre y el documento de identidad son obligatorios.</div>`;
                return false;
            }
            if (!Number.isInteger(quantity) || quantity <= 0) {
                feedbackBox.innerHTML = `<div class="alert alert-danger mb-0">La cantidad de cupos debe ser al menos 1.</div>`;
                return false;
            }
            return true;
        }

        function runPaymentProgressBar() {
            return new Promise((resolve) => {
                const simArea = document.getElementById('paymentSimulationArea');
                const bar = document.getElementById('paymentProgressBar');
                const percentLabel = document.getElementById('paymentPercentLabel');
                const statusLabel = document.getElementById('paymentStatusLabel');

                simArea.style.display = 'block';
                bar.style.width = '0%';
                percentLabel.textContent = '0%';
                statusLabel.textContent = 'Procesando transacción...';

                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        bar.style.width = '100%';
                        percentLabel.textContent = '100%';
                        statusLabel.textContent = 'Pago exitoso';
                        resolve();
                    } else {
                        bar.style.width = `${progress}%`;
                        percentLabel.textContent = `${progress}%`;
                    }
                }, 130);
            });
        }

        async function simulatePaymentAndRegister() {
            if (isProcessingPayment) return;
            if (!validateRegistrationForm()) return;

            const payButton = document.getElementById('payButton');
            const feedbackBox = document.getElementById('registrationFeedback');
            isProcessingPayment = true;
            payButton.disabled = true;
            feedbackBox.innerHTML = '';

            await runPaymentProgressBar();

            const { quantity, totalPrice } = calculateTotalAmount();
            const emailVal = document.getElementById('attendeeEmailInput').value.trim();
            const birthVal = document.getElementById('attendeeBirthDateInput').value;

            const payload = {
                eventId: selectedEvent.id,
                membershipId: attendeeType === 'member' && verifiedMember ? verifiedMember.id : null,
                idCard: document.getElementById('attendeeDocumentInput').value.trim(),
                name: document.getElementById('attendeeNameInput').value.trim(),
                email: emailVal || null,
                birthDate: birthVal || null,
                personsAssistance: quantity,
                price: totalPrice,
                attendanceStatus: 1
            };

            try {
                const response = await fetch(ATTENDANCE_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const savedAttendance = await response.json();
                    feedbackBox.innerHTML = `
                        <div class="alert alert-info mb-0">
                            <strong>Pago exitoso.</strong> Inscripción confirmada para <strong>${selectedEvent.title}</strong> (${quantity} cupo(s) · Código de asistencia: <strong>${savedAttendance.code || '—'}</strong>).
                        </div>
                    `;
                    document.getElementById('registrationForm').reset();
                    selectedEvent = null;
                    verifiedMember = null;
                    document.getElementById('eventPreviewBox').style.display = 'none';
                    setAttendeeType(attendeeType);
                } else {
                    const errText = await response.text();
                    feedbackBox.innerHTML = `
                        <div class="alert alert-danger mb-0">
                            ${errText || 'No se pudo completar la inscripción en el servidor.'}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error registering attendance:', error);
                feedbackBox.innerHTML = `
                    <div class="alert alert-danger mb-0">
                        Error de conexión con el servidor en el puerto 8080.
                    </div>
                `;
            } finally {
                isProcessingPayment = false;
                payButton.disabled = false;
            }
        }
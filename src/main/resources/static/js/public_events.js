const PUBLISH_API_URL = 'http://localhost:8080/api/event/publish';
        const OBJECTS_API_URL = 'http://localhost:8080/api/object';

        document.addEventListener('DOMContentLoaded', () => {
            loadAstronomicalObjects();
            toggleObjectRequirement();
        });

        async function loadAstronomicalObjects() {
            const select = document.getElementById('objectId');
            try {
                const response = await fetch(OBJECTS_API_URL);
                if (!response.ok) return;
                const objects = await response.json();
                objects.forEach((obj) => {
                    const option = document.createElement('option');
                    option.value = obj.id;
                    option.textContent = `${obj.code} — ${obj.name}`;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading astronomical objects:', error);
            }
        }

        function toggleObjectRequirement() {
            const eventType = document.getElementById('type').value;
            const objectSelect = document.getElementById('objectId');
            const objectLabel = document.getElementById('objectLabel');

            if (eventType === 'ASTRONOMICAL') {
                objectSelect.required = true;
                objectLabel.textContent = 'Objeto Astronómico (Obligatorio para Astronómico)';
            } else {
                objectSelect.required = false;
                objectLabel.textContent = 'Objeto Astronómico (Opcional para Divulgativo)';
            }
        }

        document.getElementById('publishEventForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const feedbackBox = document.getElementById('publishFeedback');

            const identifier = document.getElementById('memberIdentifier').value.trim();
            const password = document.getElementById('memberPassword').value;
            const objectValue = document.getElementById('objectId').value;
            const imageValue = document.getElementById('eventImage').value.trim();
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            if (new Date(endDate) < new Date(startDate)) {
                feedbackBox.innerHTML = `
                    <div class="alert alert-danger mb-0">
                        La fecha y hora de fin no puede ser anterior a la de inicio.
                    </div>
                `;
                return;
            }

            const eventPayload = {
                type: document.getElementById('type').value,
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim(),
                idObject: objectValue ? parseInt(objectValue, 10) : null,
                ticketPrice: parseInt(document.getElementById('ticketPrice').value, 10),
                location: document.getElementById('location').value.trim(),
                eventImage: imageValue || null,
                maximumCapacity: parseInt(document.getElementById('maximumCapacity').value, 10),
                startDate,
                endDate
            };

            const params = new URLSearchParams({ identifier, password });

            try {
                const response = await fetch(`${PUBLISH_API_URL}?${params.toString()}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventPayload)
                });

                if (response.ok) {
                    const createdEvent = await response.json();
                    const generatedCodeText = createdEvent.code ? ` (Código generado: <strong>${createdEvent.code}</strong>)` : '';
                    feedbackBox.innerHTML = `
                        <div class="alert alert-info mb-0">
                            ¡Evento <strong>${createdEvent.title}</strong> publicado con éxito!${generatedCodeText} Ya aparece disponible en la cartelera.
                        </div>
                    `;
                    event.target.reset();
                    toggleObjectRequirement();
                } else {
                    const errorText = await response.text();
                    feedbackBox.innerHTML = `
                        <div class="alert alert-danger mb-0">
                            ${errorText || 'No se pudo publicar el evento. Verifica tu correo o documento y tu contraseña de membresía.'}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error publishing event:', error);
                feedbackBox.innerHTML = `
                    <div class="alert alert-danger mb-0">
                        Error de conexión con el servidor en el puerto 8080.
                    </div>
                `;
            }
        });
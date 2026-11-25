//Variable que almacena el codigo y se lo pasa al formulario de inscripción
        let modalEventCode = '';
        const EVENTS_API_URL = 'http://localhost:8080/api/event';
        const FALLBACK_IMAGE = 'event_images/event_default.jpeg';
        let eventBoard = [];

        document.addEventListener('DOMContentLoaded', loadEventBoard);

        async function loadEventBoard() {
            try {
                const response = await fetch(EVENTS_API_URL);
                if (!response.ok) throw new Error('Failed to connect to the events API');
                eventBoard = await response.json();
                renderEventCards(eventBoard, false);
            } catch (error) {
                console.error(error);
                document.getElementById('eventsGrid').innerHTML = `
                    <div class="col-12">
                        <div class="empty-state text-danger">⚠️ Error de conexión con Spring Boot. Verifica que el servidor esté activo en el puerto 8080.</div>
                    </div>
                `;
            }
        }

        function normalizeText(value) {
            return (value || '')
                .toString()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();
        }

        function getTypeSearchKeywords(type) {
            if (type === 'ASTRONOMICAL') return 'astronomical astronomico astronomia observacion';
            if (type === 'DIVULGATIVE') return 'divulgative divulgativo divulgacion charla conferencia';
            return normalizeText(type);
        }

        function renderEventCards(eventsList, isSearchActive = false) {
            const grid = document.getElementById('eventsGrid');
            if (!eventsList || eventsList.length === 0) {
                const emptyContent = isSearchActive
                    ? `No se encontraron eventos que coincidan con tu búsqueda.<div class="mt-3"><button type="button" class="btn btn-borde-cosmos btn-sm px-3 py-2" onclick="clearSearch()">Limpiar búsqueda</button></div>`
                    : 'No hay eventos registrados en este momento.';
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="empty-state">${emptyContent}</div>
                    </div>
                `;
                return;
            }

            grid.innerHTML = eventsList.map((eventItem) => {
                const imageSrc = eventItem.eventImage && eventItem.eventImage.trim() !== '' ? eventItem.eventImage : FALLBACK_IMAGE;
                const typeClass = eventItem.type === 'ASTRONOMICAL' ? 'astronomical' : 'divulgative';
                const typeLabel = eventItem.type === 'ASTRONOMICAL' ? '🔭 Astronómico' : '🎓 Divulgativo';
                const startDateText = eventItem.startDate ? eventItem.startDate.replace('T', ' ').slice(0, 16) : '';
                const ticketPrice = Number(eventItem.ticketPrice) || 0;
                const formattedPrice = ticketPrice === 0 ? '¡Evento Gratuito!' : `$${ticketPrice.toLocaleString('es-CO')}`;

                return `
                    <div class="col-lg-4 col-md-6">
                        <article class="event-card ${typeClass}">
                            <img class="card-img-top" src="${imageSrc}" alt="${eventItem.title}" onerror="this.src='${FALLBACK_IMAGE}'">
                            <div class="card-body p-4 d-flex flex-column flex-grow-1">
                                <span class="type-badge">${typeLabel}</span>
                                <h3 class="h4 fw-bold text-white mb-2">${eventItem.title}</h3>
                                <div class="text-info small mb-2">📅 ${startDateText}</div>
                                <div class="text-secondary small mb-3">📍 ${eventItem.location}</div>
                                <div class="mt-auto pt-2 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-25">
                                    <span class="text-white fw-bold">${formattedPrice}</span>
                                    <button type="button" class="btn btn-cian-cosmos px-3 py-2 fw-bold" style="font-size: 0.85rem;" onclick="openEventModal(${eventItem.id})">
                                        Ver Detalles &rarr;
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                `;
            }).join('');
        }

        function filterEvents() {
            const searchInput = document.getElementById('searchInput');
            const clearBtn = document.getElementById('clearSearchBtn');
            const query = normalizeText(searchInput.value);

            clearBtn.style.display = query ? 'inline-block' : 'none';

            if (!query) {
                renderEventCards(eventBoard, false);
                return;
            }

            const filteredEvents = eventBoard.filter((eventItem) => {
                const title = normalizeText(eventItem.title);
                const location = normalizeText(eventItem.location);
                const code = normalizeText(eventItem.code);
                const typeKeywords = `${normalizeText(eventItem.type)} ${getTypeSearchKeywords(eventItem.type)}`;

                return (
                    title.includes(query) ||
                    location.includes(query) ||
                    code.includes(query) ||
                    typeKeywords.includes(query)
                );
            });

            renderEventCards(filteredEvents, true);
        }

        function clearSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
            filterEvents();
            searchInput.focus();
        }

        function openEventModal(eventId) {
            const eventItem = eventBoard.find((item) => item.id === eventId);
            if (!eventItem) return;

            const imageSrc = eventItem.eventImage && eventItem.eventImage.trim() !== '' ? eventItem.eventImage : FALLBACK_IMAGE;
            const typeLabel = eventItem.type === 'ASTRONOMICAL' ? '🔭 Evento Astronómico' : '🎓 Evento Divulgativo';
            const startDateText = eventItem.startDate ? eventItem.startDate.replace('T', ' ').slice(0, 16) : '';
            const endDateText = eventItem.endDate ? eventItem.endDate.replace('T', ' ').slice(0, 16) : '';
            const ticketPrice = Number(eventItem.ticketPrice) || 0;
            const formattedPrice = ticketPrice === 0 ? '¡Evento Gratuito!' : `Precio: $${ticketPrice.toLocaleString('es-CO')} COP`;

            document.getElementById('modalImg').src = imageSrc;
            document.getElementById('modalImg').onerror = function() { this.src = FALLBACK_IMAGE; };
            document.getElementById('modalTypeBadge').textContent = typeLabel;
            document.getElementById('modalTitle').textContent = eventItem.title;
            document.getElementById('modalDate').textContent = `📅 Del ${startDateText} al ${endDateText}`;
            document.getElementById('modalLocationText').textContent = eventItem.location;
            document.getElementById('modalCapacityText').textContent = eventItem.maximumCapacity;
            document.getElementById('modalPrice').textContent = formattedPrice;
            document.getElementById('modalDesc').textContent = eventItem.description || 'Sin descripción detallada disponible.';
            document.getElementById('modalCodeText').textContent = eventItem.code;

            const modal = new bootstrap.Modal(document.getElementById('eventModal'));
            modal.show();
            //Guardo el codigo
            modalEventCode = eventItem.code != null ? String(eventItem.code).trim() : '';
        }
        //Guardo el codigo para precargarlo en el formulario de inscripcion en caso de que el usuario acceda desde aqui
        function goToRegistrationFromModal() {
            if (!modalEventCode) {
                window.location.href = "event_registration.html";
                return;
            }
            window.location.href = `event_registration.html?code=${encodeURIComponent(modalEventCode)}`;
            }
        /*________________________*/
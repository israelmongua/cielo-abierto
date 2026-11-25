document.addEventListener("DOMContentLoaded", () => {
    const EVENTS_URL = 'http://localhost:8080/api/event';

    const container = document.getElementById('telemetryList');
    const pulse = document.getElementById('telePulse');
    const statusText = document.getElementById('teleStatusText');

    fetch(EVENTS_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // 1. Slice the array to keep at most the first 2 events
            const topFive = data.slice(0, 2);

            if (topFive.length === 0) {
                container.innerHTML = '<p class="text-secondary mb-0">No upcoming events registered.</p>';
                return;
            }

            // 2. Update status indicator to connected (green)
            pulse.classList.remove('bg-warning');
            statusText.textContent = `MOSTRANDO ${topFive.length} EVENTOS`;

            // 3. Clear the "Querying..." message
            container.innerHTML = '';

            // 4. Loop through the 5 events and build their HTML cards
            topFive.forEach(event => {
                // Date formatting
                let dateText = "TBD";
                if (event.fecha) {
                    const dateObj = new Date(event.fecha);
                    dateText = dateObj.toLocaleDateString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                }

                // Build the telemetry row for this event
                const rowHTML = `
                    <div class="tele-item p-3 align-items-center">
                        <div class="row align-items-center g-3">
                            <div class="col-lg-4">
                                <span class="tele-label d-block">Event</span>
                                <span class="text-white fw-bold fs-6">${event.title || "Sin titulo"}</span>
                            </div>
                            <div class="col-6 col-lg-3">
                                <span class="tele-label d-block">Date</span>
                                <span class="tele-valor fs-6">${event.startDate}</span>
                            </div>
                            <div class="col-6 col-lg-3">
                                <span class="tele-label d-block">Category</span>
                                <span class="tele-valor fs-6">${event.type || "Sin categoria"}</span>
                            </div>
                            <div class="col-6 col-lg-3">
                                <span class="tele-label d-block">Ubicacion</span>
                                <span class="tele-valor fs-6">${event.location || "Sin Ubicación"}</span>
                            </div>
                            <div class="col-12 col-lg-2 text-lg-end">
                                <span class="tele-label d-block">Precio</span>
                                <span class="badge-telemetria">${event.price || "Gratis"}</span>
                            </div>
                        </div>
                    </div>
                `;

                // Append the row inside the main container
                container.innerHTML += rowHTML;
            });
        })
        .catch(error => {
            console.error("Error loading events:", error);
            pulse.style.backgroundColor = "#EF4444";
            pulse.style.boxShadow = "0 0 8px #EF4444";
            statusText.textContent = "OFFLINE";
            container.innerHTML = '<p class="text-danger small font-monospace mb-0">Could not connect to the Spring Boot server.</p>';
        });
});
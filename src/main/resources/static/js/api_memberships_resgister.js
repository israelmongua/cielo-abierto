const API_URL = 'http://localhost:8080/api/membership'; //[cite: 4]

document.getElementById('registroMembresiaForm').addEventListener('submit', async (e) => { //[cite: 4]
    e.preventDefault(); //[cite: 4]
    const msg = document.getElementById('mensajeRegistro'); //[cite: 4]

    const nuevaMembresia = { //[cite: 4]
        name: document.getElementById('name').value.trim(), //[cite: 4]
        idCard: document.getElementById('idCard').value.trim(), //[cite: 4]
        email: document.getElementById('email').value.trim(), //[cite: 4]
        password: document.getElementById('password').value, //[cite: 4]
        birthDate: document.getElementById('birthDate').value, //[cite: 4]
    };

    try {
        const res = await fetch(API_URL, { //[cite: 4]
            method: 'POST', //[cite: 4]
            headers: { 'Content-Type': 'application/json' }, //[cite: 4]
            body: JSON.stringify(nuevaMembresia) //[cite: 4]
        });

        if (res.ok) { //[cite: 4]
            const creada = await res.json(); //[cite: 4]
            msg.innerHTML = `<div class="alert alert-info py-2 small mb-0">¡Membresía activada! Tu ID de creador es <strong>#${creada.id}</strong> y ya cuentas con tu <strong>10% de descuento</strong> en eventos.</div>`; //[cite: 4]
            e.target.reset(); //[cite: 4]
        } else {
            const rawError = await res.text(); //[cite: 4]
            let errText = rawError || `Error HTTP ${res.status}`;
            try {
                const parsed = JSON.parse(rawError);
                errText = parsed.message || parsed.error || errText;
            } catch (_) {
                // Si no es JSON, se conserva el texto plano devuelto por el backend
            }
            msg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">No se pudo registrar la membresía: ${errText}</div>`; //[cite: 4]
        }
    } catch (err) {
        console.error(err); //[cite: 4]
        msg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error al conectar con Spring Boot.</div>`; //[cite: 4]
    }
});
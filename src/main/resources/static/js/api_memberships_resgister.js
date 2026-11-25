const API_URL = 'http://localhost:8080/api/membership'; 

document.getElementById('registroMembresiaForm').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    const msg = document.getElementById('mensajeRegistro'); 

    const nuevaMembresia = { 
        name: document.getElementById('name').value.trim(), 
        idCard: document.getElementById('idCard').value.trim(), 
        email: document.getElementById('email').value.trim(), 
        password: document.getElementById('password').value, 
        birthDate: document.getElementById('birthDate').value, 
    };

    try {
        const res = await fetch(API_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMembresia) 
        });

        if (res.ok) { 
            const creada = await res.json(); 
            msg.innerHTML = `<div class="alert alert-info py-2 small mb-0">¡Membresía activada! Tu ID de creador es <strong>#${creada.id}</strong> y ya cuentas con tu <strong>10% de descuento</strong> en eventos.</div>`; //[cite: 4]
            e.target.reset();
        } else {
            const rawError = await res.text(); 
            let errText = rawError || `Error HTTP ${res.status}`;
            try {
                const parsed = JSON.parse(rawError);
                errText = parsed.message || parsed.error || errText;
            } catch (_) {
                // Si no es JSON, se conserva el texto plano devuelto por el backend
            }
            msg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">No se pudo registrar la membresía: ${errText}</div>`; 
        }
    } catch (err) {
        console.error(err); 
        msg.innerHTML = `<div class="alert alert-danger py-2 small mb-0">Error al conectar con Spring Boot.</div>`; 
    }
});
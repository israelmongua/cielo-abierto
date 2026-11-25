// Animación 2D ligera de respaldo para #orbitas (reemplazable por Three.js)
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('orbitas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    function ajustarTamano() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    ajustarTamano();
    window.addEventListener('resize', ajustarTamano);

    // Planetas: [radioÓrbita, radioPlaneta, velocidadAngular, color, ánguloInicial]
    const planetas = [
        { r: 38,  size: 3,   speed: 0.025, color: '#94A3B8', angle: 0.5 }, // Mercurio
        { r: 62,  size: 4.5, speed: 0.018, color: '#FDE047', angle: 2.1 }, // Venus
        { r: 90,  size: 5,   speed: 0.012, color: '#38BDF8', angle: 4.0 }, // Tierra
        { r: 122, size: 4,   speed: 0.008, color: '#F87171', angle: 1.2 }  // Marte
    ];

    function animarOrbitas() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sol central con halo
        const gradSol = ctx.createRadialGradient(cx, cy, 4, cx, cy, 24);
        gradSol.addColorStop(0, '#FEF08A');
        gradSol.addColorStop(0.5, '#F59E0B');
        gradSol.addColorStop(1, 'transparent');
        ctx.fillStyle = gradSol;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar órbitas y planetas
        planetas.forEach(p => {
            // Anillo orbital
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
            ctx.stroke();

            // Posición del planeta
            p.angle += p.speed;
            const px = cx + Math.cos(p.angle) * p.r;
            const py = cy + Math.sin(p.angle) * p.r;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animarOrbitas);
    }

    animarOrbitas();
});
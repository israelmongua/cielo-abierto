// 1. Seleccionamos el lienzo y obtenemos su herramienta de dibujo 2D
const canvas = document.getElementById('cielo');
const ctx = canvas.getContext('2d');

let estrellas = [];
const CANTIDAD_ESTRELLAS = 120;

// 2. Ajustar el tamaño del lienzo al de la ventana del navegador
function ajustarPantalla() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 3. Crear las estrellas con propiedades aleatorias
function crearEstrellas() {
    estrellas = [];
    for (let i = 0; i < CANTIDAD_ESTRELLAS; i++) {
        estrellas.push({
            x: Math.random() * canvas.width,       // Posición horizontal
            y: Math.random() * canvas.height,      // Posición vertical
            radio: Math.random() * 1.5 + 0.5,      // Tamaño de la estrella
            velocidad: Math.random() * 0.3 + 0.1,  // Qué tan rápido sube
            brillo: Math.random()                  // Transparencia (opacidad)
        });
    }
}

// 4. Dibujar y mover cada estrella en cada fotograma
function animar() {
    // Limpiamos el lienzo antes de dibujar el siguiente cuadro
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    estrellas.forEach(estrella => {
        // Dibujamos el círculo (la estrella)
        ctx.beginPath();
        ctx.arc(estrella.x, estrella.y, estrella.radio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${estrella.brillo})`;
        ctx.fill();

        // Movemos la estrella ligeramente hacia arriba
        estrella.y -= estrella.velocidad;

        // Si sale por el borde superior, la reaparecemos abajo
        if (estrella.y < 0) {
            estrella.y = canvas.height;
            estrella.x = Math.random() * canvas.width;
        }
    });

    // Repetimos esta función en el siguiente fotograma de pantalla
    requestAnimationFrame(animar);
}

// Si el usuario cambia el tamaño de la ventana, reajustamos todo
window.addEventListener('resize', () => {
    ajustarPantalla();
    crearEstrellas();
});

// Arrancamos el fondo
ajustarPantalla();
crearEstrellas();
animar();
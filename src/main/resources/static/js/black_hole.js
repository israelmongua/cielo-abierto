/* agujero-negro.js — agujero negro con disco de acreción en <canvas>. Sin librerías.

   Truco visual: el disco visto casi de canto es una elipse aplastada. La luz de la parte
   de ATRÁS del disco se curva sobre el agujero (lente gravitacional), así que esas
   partículas se dibujan también como un halo circular. El lado que se acerca a nosotros
   brilla más (efecto Doppler).

   Uso:  <canvas data-agujero-negro></canvas>      (se inicia solo)
         new AgujeroNegro(canvas, { particulas: 800, velocidad: 2 })   (a mano)          */
(() => {
  const TAU = Math.PI * 2;
  // color del disco según la distancia al centro: blanco caliente -> dorado -> naranja -> púrpura
  const COLORES = [[2.3, '255,244,205'], [3.2, '255,183,3'], [4, '255,110,50'], [Infinity, '157,78,221']];
  const color = r => COLORES.find(([max]) => r < max)[1];

  class AgujeroNegro {
    constructor(canvas, opciones = {}) {
      this.canvas = canvas;
      this.b = canvas.getContext('2d');
      // particulas: cantidad · velocidad: 1 = normal · inclinacion: aplastamiento del disco (0 = de canto) · horizonte: radio relativo
      this.op = { particulas: 1100, velocidad: 1, inclinacion: .26, horizonte: .1, ...opciones };
      this.reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.visible = true; this.corriendo = false;

      // Cada partícula: r = radio de órbita, a = ángulo, v = velocidad (más rápida cuanto más cerca, ley de Kepler), s = tamaño
      this.disco = Array.from({ length: this.op.particulas }, () => {
        const r = 1.7 + Math.pow(Math.random(), 1.5) * 2.5;
        return { r, a: Math.random() * TAU, v: 1 / Math.pow(r, 1.5), s: Math.random() * 1.5 + .5 };
      });

      this.ajustar();
      new ResizeObserver(() => { this.ajustar(); if (!this.corriendo) this.dibujar(performance.now()); }).observe(canvas);
      // Ahorra batería: se detiene si el canvas no está en pantalla o la pestaña está oculta
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.arrancar(); }).observe(canvas);
      document.addEventListener('visibilitychange', () => this.arrancar());
      this.arrancar();
    }

    ajustar() {                                   // tamaño real del canvas = tamaño en pantalla × densidad de píxeles
      const d = devicePixelRatio || 1, S = this.canvas.clientWidth;
      if (S && this.canvas.width !== Math.round(S * d)) this.canvas.width = this.canvas.height = Math.round(S * d);
    }

    arrancar() {
      if (this.reducido) { this.dibujar(0); return; }           // quien pide menos movimiento ve una imagen fija
      if (this.corriendo || !this.visible || document.hidden) return;
      this.corriendo = true;
      const cuadro = t => {
        if (!this.visible || document.hidden) { this.corriendo = false; return; }
        this.dibujar(t); requestAnimationFrame(cuadro);
      };
      requestAnimationFrame(cuadro);
    }

    dibujar(t) {
      const b = this.b, d = devicePixelRatio || 1, S = this.canvas.clientWidth;
      if (!S) return;
      b.setTransform(d, 0, 0, d, 0, 0); b.clearRect(0, 0, S, S);
      const c = S / 2, R = S * this.op.horizonte, k = this.op.inclinacion;

      // resplandor general
      const g = b.createRadialGradient(c, c, R, c, c, S * .5);
      g.addColorStop(0, 'rgba(58, 191, 248, 0.19)'); g.addColorStop(.35, 'rgba(125, 212, 252, 0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = g; b.fillRect(0, 0, S, S);

      // posición de cada partícula en este instante
      const pos = this.disco.map(p => {
        const a = p.a + t * p.v * this.op.velocidad / 1100;
        return { p, a, atras: Math.sin(a) < 0, br: .2 + .8 * (.5 - .5 * Math.cos(a)) };   // br: brillo Doppler
      });

      b.globalCompositeOperation = 'lighter';          // "lighter" suma la luz: donde se juntan, se acerca al blanco
      for (const q of pos) {                           // 1) disco de ATRÁS + halo curvado por la lente
        if (!q.atras) continue;
        const { p, a } = q, col = color(p.r);
        b.fillStyle = `rgb(240, 246, 248)`;
        b.fillRect(c + Math.cos(a) * p.r * R, c + Math.sin(a) * p.r * R * k, p.s, p.s);
        const rl = R * (1.08 + (p.r - 1.7) / 2.5 * .5);                       // radio del halo
        b.fillRect(c + Math.cos(a) * rl, c + Math.sin(a) * rl, p.s * 1.1, p.s * 1.1);            // arco superior
        b.fillStyle = `rgb(240, 246, 248)`;
        b.fillRect(c + Math.cos(a) * rl, c - Math.sin(a) * rl, p.s, p.s);                         // arco inferior, más tenue
      }
      b.globalCompositeOperation = 'source-over';

      b.fillStyle = '#000'; b.beginPath(); b.arc(c, c, R, 0, TAU); b.fill();  // 2) horizonte de sucesos: tapa lo que está detrás
      b.strokeStyle = 'rgb(39, 129, 168)'; b.lineWidth = 2; b.shadowColor = 'rgb(51, 65, 85)'; b.shadowBlur = 18;
      b.beginPath(); b.arc(c, c, R * 1.03, 0, TAU); b.stroke(); b.shadowBlur = 0;               // 3) anillo de fotones

      b.globalCompositeOperation = 'lighter';
      for (const q of pos) {                           // 4) disco de DELANTE: cruza por delante del agujero
        if (q.atras) continue;
        const { p, a } = q;
        b.fillStyle = `rgb(240, 246, 248)`;
        b.fillRect(c + Math.cos(a) * p.r * R, c + Math.sin(a) * p.r * R * k, p.s * 1.2, p.s * 1.2);
      }
      b.globalCompositeOperation = 'source-over';
    }
  }

  window.AgujeroNegro = AgujeroNegro;
  // Inicio automático: <canvas data-agujero-negro data-particulas="800" data-velocidad="2">
  const iniciar = () => document.querySelectorAll('canvas[data-agujero-negro]').forEach(cv => {
    const n = k => cv.dataset[k] !== undefined ? Number(cv.dataset[k]) : undefined;
    const op = {}; for (const k of ['particulas', 'velocidad', 'inclinacion', 'horizonte']) if (n(k) !== undefined) op[k] = n(k);
    new AgujeroNegro(cv, op);
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', iniciar) : iniciar();
})();
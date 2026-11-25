const API_URL = "http://localhost:8080/api/object";
const IMAGEN_FALLBACK = "object_images/object_default.jpeg";
let catalogo = [];

document.addEventListener("DOMContentLoaded", cargarCatalogo);

async function cargarCatalogo() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("No se pudo conectar con el endpoint");
    catalogo = await response.json();
    renderizarTarjetas(catalogo);
  } catch (error) {
    console.error(error);
    document.getElementById("gridObjetos").innerHTML = `
                    <div class="col-12">
                        <div class="estado-vacio text-danger">⚠️ Error de conexión con Spring Boot. Asegúrate de que el servidor esté activo en el puerto 8080.</div>
                    </div>
                `;
  }
}

function renderizarTarjetas(lista) {
  const grid = document.getElementById("gridObjetos");
  if (!lista || lista.length === 0) {
    grid.innerHTML = `
                    <div class="col-12">
                        <div class="estado-vacio">No se encontraron objetos astronómicos registrados en la base de datos.</div>
                    </div>
                `;
    return;
  }

  grid.innerHTML = lista
    .map((obj) => {
      const imgSrc =
        obj.image && obj.image.trim() !== "" ? obj.image : IMAGEN_FALLBACK;
      const descCorta = obj.description
        ? obj.description.length > 100
          ? obj.description.substring(0, 100) + "..."
          : obj.description
        : "Sin descripción técnica registrada.";

      return `
                    <div class="col-lg-4 col-md-6">
                        <article class="card-objeto">
                            <img class="card-img-top" src="${imgSrc}" alt="${obj.name}" onerror="this.src='${IMAGEN_FALLBACK}'">
                            <div class="card-body p-4 d-flex flex-column flex-grow-1">
                                <span class="badge-codigo">${obj.code}</span>
                                <h3 class="h4 fw-bold text-white mb-2">${obj.name}</h3>
                                <div class="text-info small mb-3">📍 ${obj.location || "Ubicación celeste no especificada"}</div>
                                <p class="text-secondary small mb-4 flex-grow-1" style="line-height: 1.6;">${descCorta}</p>
                                <button class="btn btn-cian-cosmos w-100 py-2 fw-bold" onclick="abrirModal(${obj.id})">
                                    Ver Ficha Técnica &rarr;
                                </button>
                            </div>
                        </article>
                    </div>
                `;
    })
    .join("");
}

function filtrarObjetos() {
  const texto = document.getElementById("buscador").value.toLowerCase().trim();
  const filtrados = catalogo.filter(
    (obj) =>
      (obj.name && obj.name.toLowerCase().includes(texto)) ||
      (obj.code && obj.code.toLowerCase().includes(texto)) ||
      (obj.location && obj.location.toLowerCase().includes(texto)),
  );
  renderizarTarjetas(filtrados);
}

function abrirModal(id) {
  const obj = catalogo.find((o) => o.id === id);
  if (!obj) return;

  const imgSrc =
    obj.image && obj.image.trim() !== "" ? obj.image : IMAGEN_FALLBACK;
  document.getElementById("modalImg").src = imgSrc;
  document.getElementById("modalImg").onerror = function () {
    this.src = IMAGEN_FALLBACK;
  };
  document.getElementById("modalCode").textContent = `CÓDIGO: ${obj.code}`;
  document.getElementById("modalTitle").textContent = obj.name;
  document.getElementById("modalLocation").textContent =
    `📍 Ubicación: ${obj.location || "No especificada"}`;
  document.getElementById("modalDesc").textContent =
    obj.description || "Sin descripción detallada disponible en el sistema.";

  const modal = new bootstrap.Modal(document.getElementById("modalObjeto"));
  modal.show();
}

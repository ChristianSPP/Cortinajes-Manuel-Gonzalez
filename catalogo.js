// catalogo.js
// ----------------------------
// Este archivo genera dinámicamente todas las galerías del catálogo.
// Ajusta las configuraciones de "GALERIAS_NUMERADAS" para agregar/quitar rangos
// y vuelve a ejecutar "node scripts/generar-galerias.js" si incorporas nuevas
// carpetas dentro de "1-disenos-cortinas-estampadas" o cambias archivos de
// "3-disenos-pattern-infantil". El script actualizará galerias-data.json con
// los nombres de archivos reales.

const DATA_JSON_PATH = 'galerias-data.json';

const GALERIAS_NUMERADAS = [
  {
    idContenedor: 'galeria-pattern-tradicional',
    carpeta: '2-disenos-pattern-tradicional',
    prefijo: 'pattern-',
    sufijo: '_baja.jpg',
    relleno: 3,
    inicio: 1,
    fin: 42,
    altBase: 'Pattern tradicional'
  },
  {
    idContenedor: 'galeria-empavonados',
    carpeta: '4-empavonados',
    prefijo: 'emp-',
    sufijo: '_baja.jpg',
    relleno: 4,
    inicio: 1,
    fin: 56,
    altBase: 'Empavonado'
  },
  {
    idContenedor: 'galeria-vinilos',
    carpeta: '5-vinilos',
    prefijo: 'vin-deco-',
    sufijo: '-baja.jpg',
    relleno: 4,
    inicio: 1,
    fin: 100,
    altBase: 'Vinilo decorativo'
  }
];

const GRID_MINIATURAS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3';
const GRID_ESTAMPADAS = 'grid gap-2 grid-cols-2 sm:grid-cols-3';

const lightboxState = {
  overlay: null,
  image: null,
  caption: null
};

document.addEventListener('DOMContentLoaded', async () => {
  inicializarLightbox();
  inicializarBotonInicio();
  actualizarAnio();

  try {
    const data = await cargarDatos();
    if (data) {
      renderizarEstampadas(data.estampadas);
      renderizarPatternInfantil(data.patternInfantil);
    }
  } catch (error) {
    console.error('No fue posible cargar galerias-data.json', error);
  }

  GALERIAS_NUMERADAS.forEach(renderizarGaleriaNumerada);
});

async function cargarDatos() {
  const respuesta = await fetch(DATA_JSON_PATH);
  if (!respuesta.ok) {
    throw new Error(`Error al cargar ${DATA_JSON_PATH}: ${respuesta.status}`);
  }
  return respuesta.json();
}

function renderizarGaleriaNumerada(config) {
  const contenedor = document.getElementById(config.idContenedor);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const tarjeta = document.createElement('article');
  tarjeta.className = 'bg-white rounded-2xl shadow-sm p-4';

  const cuadricula = document.createElement('div');
  cuadricula.className = GRID_MINIATURAS;

  for (let numero = config.inicio; numero <= config.fin; numero += 1) {
    const referencia = padStart(numero, config.relleno);
    const archivo = `${config.prefijo}${referencia}${config.sufijo}`;
    const ruta = `${config.carpeta}/${archivo}`;
    const alt = `${config.altBase} ${referencia}`;
    const miniatura = crearImagenMiniatura(ruta, alt);
    cuadricula.appendChild(miniatura);
  }

  tarjeta.appendChild(cuadricula);
  contenedor.appendChild(tarjeta);
}

function renderizarEstampadas(estampadasData) {
  const contenedor = document.getElementById('galeria-estampadas');
  const navCategorias = document.getElementById('estampadas-nav');
  if (!contenedor || !estampadasData || !Array.isArray(estampadasData.categorias)) {
    return;
  }

  contenedor.innerHTML = '';
  contenedor.className = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';
  if (navCategorias) {
    navCategorias.innerHTML = '';
    navCategorias.className = 'flex flex-wrap gap-2 text-sm';
  }

  estampadasData.categorias.forEach((categoria) => {
    const slug = generarSlug(categoria.nombre);
    const tarjeta = document.createElement('article');
    tarjeta.className = 'bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3';
    tarjeta.id = `categoria-${slug}`;

    const encabezado = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.className = 'text-lg font-semibold text-slate-900';
    titulo.textContent = categoria.nombre;

    const conteo = document.createElement('p');
    conteo.className = 'text-xs text-slate-500';
    conteo.textContent = `${categoria.imagenes.length} diseño${categoria.imagenes.length === 1 ? '' : 's'}`;

    encabezado.appendChild(titulo);
    encabezado.appendChild(conteo);

    const cuadricula = document.createElement('div');
    cuadricula.className = GRID_ESTAMPADAS;

    categoria.imagenes.forEach((archivo) => {
      const ruta = `${estampadasData.basePath}/${categoria.carpeta}/${archivo}`;
      const alt = `${categoria.nombre} – ${formatearTextoAlt(archivo)}`;
      const miniatura = crearImagenMiniatura(ruta, alt);
      cuadricula.appendChild(miniatura);
    });

    tarjeta.appendChild(encabezado);
    tarjeta.appendChild(cuadricula);
    contenedor.appendChild(tarjeta);

    if (navCategorias) {
      const enlace = document.createElement('a');
      enlace.href = `#categoria-${slug}`;
      enlace.textContent = categoria.nombre;
      enlace.className = 'px-3 py-1 rounded-full border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition';
      navCategorias.appendChild(enlace);
    }
  });
}

function renderizarPatternInfantil(patternInfantilData) {
  const contenedor = document.getElementById('galeria-pattern-infantil');
  if (!contenedor || !patternInfantilData || !Array.isArray(patternInfantilData.imagenes)) {
    return;
  }

  contenedor.innerHTML = '';
  const tarjeta = document.createElement('article');
  tarjeta.className = 'bg-white rounded-2xl shadow-sm p-4';

  const cuadricula = document.createElement('div');
  cuadricula.className = GRID_MINIATURAS;

  patternInfantilData.imagenes.forEach((archivo) => {
    const ruta = `${patternInfantilData.carpeta}/${archivo}`;
    const alt = `Pattern infantil – ${formatearTextoAlt(archivo)}`;
    const miniatura = crearImagenMiniatura(ruta, alt);
    cuadricula.appendChild(miniatura);
  });

  tarjeta.appendChild(cuadricula);
  contenedor.appendChild(tarjeta);
}

function crearImagenMiniatura(src, alt) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.className = 'w-full h-36 sm:h-40 object-cover rounded-xl shadow-sm border border-slate-200 cursor-zoom-in hover:shadow-md transition';
  img.addEventListener('click', () => abrirLightbox(src, alt));
  return img;
}

function abrirLightbox(src, alt) {
  if (!lightboxState.overlay) return;
  lightboxState.image.src = src;
  lightboxState.image.alt = alt;
  lightboxState.caption.textContent = alt;
  lightboxState.overlay.classList.remove('hidden');
  lightboxState.overlay.classList.add('flex');
}

function cerrarLightbox() {
  if (!lightboxState.overlay) return;
  lightboxState.overlay.classList.add('hidden');
  lightboxState.overlay.classList.remove('flex');
}

function inicializarLightbox() {
  lightboxState.overlay = document.getElementById('lightbox');
  lightboxState.image = document.getElementById('lightbox-imagen');
  lightboxState.caption = document.getElementById('lightbox-descripcion');

  if (!lightboxState.overlay || !lightboxState.image || !lightboxState.caption) {
    return;
  }

  const botonCerrar = document.getElementById('lightbox-cerrar');
  if (botonCerrar) {
    botonCerrar.addEventListener('click', cerrarLightbox);
  }

  lightboxState.overlay.addEventListener('click', (event) => {
    if (event.target === lightboxState.overlay) {
      cerrarLightbox();
    }
  });
}

function actualizarAnio() {
  const elemento = document.getElementById('anio-actual');
  if (elemento) {
    elemento.textContent = new Date().getFullYear();
  }
}

function inicializarBotonInicio() {
  const boton = document.getElementById('boton-volver-arriba');
  if (!boton) {
    return;
  }

  const mostrarBoton = () => {
    const deberiaMostrar = window.scrollY > 250;
    boton.setAttribute('aria-hidden', deberiaMostrar ? 'false' : 'true');
    if (deberiaMostrar) {
      boton.classList.remove('opacity-0', 'pointer-events-none');
      boton.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      boton.classList.add('opacity-0', 'pointer-events-none');
      boton.classList.remove('opacity-100', 'pointer-events-auto');
    }
  };

  window.addEventListener('scroll', mostrarBoton, { passive: true });
  mostrarBoton();

  boton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function padStart(numero, longitud) {
  return numero.toString().padStart(longitud, '0');
}

function formatearTextoAlt(nombreArchivo) {
  return nombreArchivo
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generarSlug(texto) {
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

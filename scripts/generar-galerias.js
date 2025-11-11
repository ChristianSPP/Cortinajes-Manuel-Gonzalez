// scripts/generar-galerias.js
// Ejecuta `node scripts/generar-galerias.js` para actualizar automaticamente
// el archivo galerias-data.json cuando agregues o elimines imágenes.

const fs = require('fs');
const path = require('path');

// Utilidad para leer archivos de imagen permitidos
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const repoRoot = path.resolve(__dirname, '..');

const estampadasDir = path.join(repoRoot, '1-disenos-cortinas-estampadas');
const data = {
  estampadas: {
    basePath: '1-disenos-cortinas-estampadas',
    categorias: []
  },
  patternTradicional: {
    carpeta: '2-disenos-pattern-tradicional',
    imagenes: []
  },
  patternInfantil: {
    carpeta: '3-disenos-pattern-infantil',
    imagenes: []
  },
  empavonados: {
    carpeta: '4-empavonados',
    imagenes: []
  },
  vinilos: {
    carpeta: '5-vinilos',
    imagenes: []
  }
};

// Convierte el nombre de la carpeta en un título legible.
const toTitle = (folderName) => {
  return folderName
    .split(/[-_]/g)
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const collator = new Intl.Collator('es');

const listarImagenes = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort(collator.compare);
};

if (fs.existsSync(estampadasDir)) {
  const categoryEntries = fs
    .readdirSync(estampadasDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const category of categoryEntries) {
    const categoryPath = path.join(estampadasDir, category.name);
    const files = listarImagenes(categoryPath);

    data.estampadas.categorias.push({
      nombre: toTitle(category.name),
      carpeta: category.name,
      imagenes: files
    });
  }

  data.estampadas.categorias.sort((a, b) => collator.compare(a.nombre, b.nombre));
}

data.patternTradicional.imagenes = listarImagenes(
  path.join(repoRoot, data.patternTradicional.carpeta)
);

data.patternInfantil.imagenes = listarImagenes(
  path.join(repoRoot, data.patternInfantil.carpeta)
);

data.empavonados.imagenes = listarImagenes(
  path.join(repoRoot, data.empavonados.carpeta)
);

data.vinilos.imagenes = listarImagenes(path.join(repoRoot, data.vinilos.carpeta));

fs.writeFileSync(
  path.join(repoRoot, 'galerias-data.json'),
  JSON.stringify(data, null, 2),
  'utf8'
);

console.log('Archivo galerias-data.json actualizado con éxito.');

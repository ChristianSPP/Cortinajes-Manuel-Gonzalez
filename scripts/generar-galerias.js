// scripts/generar-galerias.js
// Ejecuta `node scripts/generar-galerias.js` para actualizar automaticamente
// el archivo galerias-data.json cuando agregues o elimines imágenes.

const fs = require('fs');
const path = require('path');

// Utilidad para leer archivos de imagen permitidos
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const repoRoot = path.resolve(__dirname, '..');

const estampadasDir = path.join(repoRoot, '1-disenos-cortinas-estampadas');
const patternInfantilDir = path.join(repoRoot, '3-disenos-pattern-infantil');

const data = {
  estampadas: {
    basePath: '1-disenos-cortinas-estampadas',
    categorias: []
  },
  patternInfantil: {
    carpeta: '3-disenos-pattern-infantil',
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

if (fs.existsSync(estampadasDir)) {
  const categoryEntries = fs
    .readdirSync(estampadasDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const collator = new Intl.Collator('es');

  for (const category of categoryEntries) {
    const categoryPath = path.join(estampadasDir, category.name);
    const files = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort(collator.compare);

    data.estampadas.categorias.push({
      nombre: toTitle(category.name),
      carpeta: category.name,
      imagenes: files
    });
  }

  data.estampadas.categorias.sort((a, b) => collator.compare(a.nombre, b.nombre));
}

if (fs.existsSync(patternInfantilDir)) {
  const collator = new Intl.Collator('es');
  data.patternInfantil.imagenes = fs
    .readdirSync(patternInfantilDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort(collator.compare);
}

fs.writeFileSync(
  path.join(repoRoot, 'galerias-data.json'),
  JSON.stringify(data, null, 2),
  'utf8'
);

console.log('Archivo galerias-data.json actualizado con éxito.');

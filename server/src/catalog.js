import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function assetPaths(directory = path.join(root, 'imagenes'), prefix = 'imagenes') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = `${prefix}/${entry.name}`;
    return entry.isDirectory()
      ? assetPaths(path.join(directory, entry.name), relative)
      : [relative];
  });
}

const localAssets = assetPaths();

function resolveImage(image, name) {
  const repaired = image.replace(/\uFFFD/g, 'Ñ');
  if (fs.existsSync(path.join(root, repaired))) return repaired;
  const tokens = name.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .split(/\W+/).filter((token) => token.length > 3);
  const normalized = (value) => value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const candidates = localAssets.filter((asset) => {
    const basename = normalized(path.basename(asset));
    return tokens.length > 1 ? tokens.every((token) => basename.includes(token)) : tokens.some((token) => basename.includes(token));
  });
  return candidates[0] || 'imagenes/logo.png';
}

export function readCatalog() {
  const files = fs.readdirSync(root).filter((file) => /^categoria_.*\.html$/i.test(file)).sort();
  const products = [];
  for (const file of files) {
    const category = file.replace(/^categoria_/i, '').replace(/\.html$/i, '');
    const $ = load(fs.readFileSync(path.join(root, file), 'utf8'));
    $('.card-pro').each((_, card) => {
      const element = $(card);
      const title = element.find('.card-info h4').first().text().trim();
      const descriptionHtml = element.find('.descripcion').first().html() || '';
      const description = load(`<div>${descriptionHtml.replace(/<br\s*\/?>/gi, ' ')}</div>`)
        .text().replace(/\s+/g, ' ').trim();
      const image = element.find('.card-img img').first().attr('src') || 'imagenes/logo.png';
      const priceText = element.find('.precio').first().text().replace(',', '.');
      const price = Number((priceText.match(/\d+(?:\.\d{1,2})?/) || [])[0]);
      const click = element.find('.btn-carrito').attr('onclick') || '';
      const itemName = click.match(/agregarAlCarrito\(\s*(['"])((?:\\.|(?!\1).)*)\1/i);
      const name = itemName ? itemName[2].replace(/\\'/g, "'").replace(/\\"/g, '"') : title;
      if (!name || !Number.isFinite(price)) return;
      products.push({
        name: name.replace(/\s+/g, ' ').trim(),
        category,
        description,
        price,
        image: resolveImage(image.replace(/\\/g, '/'), name),
        stock: 20,
        active: true
      });
    });
  }
  const unique = new Map();
  for (const product of products) {
    const key = `${product.category}:${product.name.toLocaleLowerCase('es')}`;
    if (!unique.has(key)) unique.set(key, product);
  }
  const legacyFile = path.join(root, 'data', 'productos.json');
  if (fs.existsSync(legacyFile)) {
    const legacyProducts = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
    for (const product of legacyProducts) {
      const name = String(product.nombre || '').trim();
      const category = String(product.categoria || '').trim().toLowerCase();
      const key = `${category}:${name.toLocaleLowerCase('es')}`;
      if (name && category && Number.isFinite(Number(product.precio)) && !unique.has(key)) {
        unique.set(key, {
          name,
          category,
          description: '',
          price: Number(product.precio),
          image: resolveImage(String(product.imagen || 'imagenes/logo.png').replace(/\\/g, '/'), name),
          stock: 20,
          active: true
        });
      }
    }
  }
  return [...unique.values()];
}

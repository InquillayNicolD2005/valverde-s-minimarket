import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/database.js';
import { Offer, Product, SiteContent, User } from '../src/models.js';
import { readCatalog } from '../src/catalog.js';

try {
  await sequelize.authenticate();
  await sequelize.sync();
  const production = process.env.NODE_ENV === 'production';
  const adminPassword = process.env.ADMIN_PASSWORD || (production ? '' : 'admin123');
  if (production && !adminPassword) throw new Error('ADMIN_PASSWORD must be set before seeding production.');
  if (adminPassword) {
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@valverdes.local' },
      defaults: {
        name: 'Administrador', email: 'admin@valverdes.local',
        passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin'
      }
    });
    if (adminPassword && admin.role !== 'admin') await admin.update({ role: 'admin' });
  } else {
    console.warn('ADMIN_PASSWORD is required to seed the production admin account.');
  }

  const catalog = readCatalog();
  for (const product of catalog) {
    await Product.findOrCreate({ where: { name: product.name, category: product.category }, defaults: product });
  }
  const defaultOffers = [
    { name: 'Canasta de frutas', description: 'Frutas frescas seleccionadas para compartir.', image: 'imagenes/ofertas/oferta2.png', originalPrice: 16.20, offerPrice: 12.96, label: '20% OFF' },
    { name: 'Bebidas 2x1', description: 'Aprovecha nuestras bebidas favoritas.', image: 'imagenes/ofertas/oferta1.png', originalPrice: 7.60, offerPrice: 3.80, label: '2x1' },
    { name: 'Snacks para compartir', description: 'Una selección de galletas y snacks.', image: 'imagenes/ofertas/oferta4.png', originalPrice: 4.50, offerPrice: 4.05, label: '10% OFF' },
    { name: 'Combo desayuno', description: 'Leche, pan y café para empezar el día.', image: 'imagenes/ofertas/oferta5.png', originalPrice: 12, offerPrice: 9.90, label: 'AHORRO' }
  ];
  for (const offer of defaultOffers) await Offer.findOrCreate({ where: { name: offer.name }, defaults: offer });
  const about = {
    about_hero: 'Desde Cusco trabajamos cada día para llevarte productos esenciales con atención cercana y entregas rápidas.',
    about_mision: 'Ofrecer una experiencia de compra rápida, amable y confiable, con productos frescos y de primera necesidad para nuestros vecinos de Cusco.',
    about_vision: 'Ser el minimarket de referencia de nuestra comunidad mediante servicio innovador, variedad y compromiso constante con nuestros clientes.'
  };
  for (const [key, content] of Object.entries(about)) await SiteContent.findOrCreate({ where: { key }, defaults: { key, content } });
  console.log(`Seed complete: ${catalog.length} catalog entries parsed, offers and about content ready.`);
} finally {
  await sequelize.close();
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize } from './database.js';
import { Offer, Order, Product, SiteContent, User } from './models.js';
import { authenticate, optionalAuthenticate, requireAdmin, safeUser, signToken } from './auth.js';
import { readCatalog } from './catalog.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((item) => item.trim()) : true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'valverdes-api' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = '', address = '' } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Completa tu nombre, correo y una contraseña de al menos 8 caracteres.' });
    }
    const user = await User.create({
      name: name.trim(), email: email.trim().toLowerCase(), phone, address,
      passwordHash: await bcrypt.hash(password, 12)
    });
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = String(email || username || '').trim().toLowerCase();
    const user = identifier === 'admin'
      ? await User.findOne({ where: { role: 'admin' } })
      : await User.findOne({ where: { email: identifier } });
    if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }
    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/logout', authenticate, (_req, res) => res.json({ message: 'Sesión cerrada.' }));
app.get('/api/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.auth.sub);
    if (!user) return res.status(401).json({ message: 'La cuenta ya no existe.' });
    res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const where = { active: true };
    if (req.query.category) where.category = req.query.category;
    if (req.query.q) where.name = { [Op.like]: `%${String(req.query.q).slice(0, 100)}%` };
    res.json({ products: await Product.findAll({ where, order: [['name', 'ASC']] }) });
  } catch (error) { next(error); }
});
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product || (!product.active && req.auth?.role !== 'admin')) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ product });
  } catch (error) { next(error); }
});
app.post('/api/products', authenticate, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ product: await Product.create(req.body) }); } catch (error) { next(error); }
});
app.put('/api/products/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    await product.update(req.body);
    res.json({ product });
  } catch (error) { next(error); }
});
app.delete('/api/products/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    await product.update({ active: false });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/offers', async (_req, res, next) => {
  try { res.json({ offers: await Offer.findAll({ where: { active: true }, order: [['id', 'ASC']] }) }); } catch (error) { next(error); }
});
app.get('/api/offers/admin', authenticate, requireAdmin, async (_req, res, next) => {
  try { res.json({ offers: await Offer.findAll({ order: [['id', 'ASC']] }) }); } catch (error) { next(error); }
});
app.post('/api/offers', authenticate, requireAdmin, async (req, res, next) => {
  try { res.status(201).json({ offer: await Offer.create(req.body) }); } catch (error) { next(error); }
});
app.put('/api/offers/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Oferta no encontrada.' });
    await offer.update(req.body);
    res.json({ offer });
  } catch (error) { next(error); }
});
app.delete('/api/offers/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Oferta no encontrada.' });
    await offer.update({ active: false });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/about', async (_req, res, next) => {
  try {
    const values = await SiteContent.findAll();
    res.json({ content: Object.fromEntries(values.map(({ key, content }) => [key, content])) });
  } catch (error) { next(error); }
});
app.put('/api/about', authenticate, requireAdmin, async (req, res, next) => {
  try {
    for (const [key, content] of Object.entries(req.body || {})) {
      await SiteContent.upsert({ key, content: String(content) });
    }
    res.json({ message: 'Contenido actualizado.' });
  } catch (error) { next(error); }
});
app.post('/api/about', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { key, content } = req.body || {};
    if (!key || content === undefined) return res.status(400).json({ message: 'La clave y el contenido son obligatorios.' });
    const [entry, created] = await SiteContent.findOrCreate({ where: { key }, defaults: { key, content: String(content) } });
    if (!created) return res.status(409).json({ message: 'Ya existe contenido con esa clave.' });
    res.status(201).json({ entry });
  } catch (error) { next(error); }
});
app.delete('/api/about/:key', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const removed = await SiteContent.destroy({ where: { key: req.params.key } });
    if (!removed) return res.status(404).json({ message: 'Contenido no encontrado.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/users', authenticate, requireAdmin, async (_req, res, next) => {
  try { res.json({ users: (await User.findAll({ order: [['createdAt', 'DESC']] })).map(safeUser) }); } catch (error) { next(error); }
});
app.get('/api/orders', authenticate, requireAdmin, async (_req, res, next) => {
  try { res.json({ orders: await Order.findAll({ include: [{ model: User, attributes: ['email'] }], order: [['createdAt', 'DESC']] }) }); } catch (error) { next(error); }
});
app.post('/api/orders', optionalAuthenticate, async (req, res, next) => {
  try {
    const { customerName, address, items, paymentMethod = 'Efectivo', deliveryTime = 'Lo antes posible' } = req.body;
    if (!customerName?.trim() || !address?.trim() || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Revisa tus datos de entrega y agrega productos al pedido.' });
    }
    const ids = items.map((item) => Number(item.productId)).filter(Number.isInteger);
    const products = await Product.findAll({ where: { id: ids, active: true } });
    const byId = new Map(products.map((product) => [product.id, product]));
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = byId.get(Number(item.productId));
      const quantity = Math.min(99, Math.max(1, Number(item.quantity) || 1));
      if (!product) throw Object.assign(new Error('Uno de los productos ya no está disponible.'), { status: 400 });
      const unitPrice = Number(product.price);
      subtotal += unitPrice * quantity;
      return { productId: product.id, name: product.name, price: unitPrice, quantity, image: product.image };
    });
    const deliveryFee = subtotal >= 50 ? 0 : 5;
    const order = await Order.create({
      userId: req.auth?.sub || null, customerName: customerName.trim(), address: address.trim(),
      deliveryTime, paymentMethod, items: orderItems, subtotal, deliveryFee, total: subtotal + deliveryFee
    });
    res.status(201).json({ order });
  } catch (error) { next(error); }
});
app.patch('/api/orders/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const statuses = ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'];
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: 'Estado de pedido no válido.' });
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' });
    await order.update({ status: req.body.status });
    res.json({ order });
  } catch (error) { next(error); }
});

app.get('/api/dashboard', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [orders, users, products, sales] = await Promise.all([
      Order.count(), User.count({ where: { role: 'customer' } }), Product.count({ where: { active: true } }),
      Order.sum('total', { where: { status: { [Op.not]: 'Cancelado' } } })
    ]);
    res.json({ metrics: { orders, customers: users, products, sales: Number(sales || 0) } });
  } catch (error) { next(error); }
});
app.post('/api/catalog/import', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const catalog = readCatalog();
    let imported = 0;
    for (const item of catalog) {
      await Product.findOrCreate({ where: { name: item.name, category: item.category }, defaults: item });
      imported += 1;
    }
    res.json({ imported, catalogEntries: catalog.length });
  } catch (error) { next(error); }
});

if (process.env.SERVE_CLIENT === 'true') {
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Ruta de API no encontrada.' }));
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Error interno del servidor.' });
});

export async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  return app.listen(port, () => console.log(`Valverde's API listening on ${port}`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().catch((error) => {
    console.error('Unable to start API:', error.message);
    process.exitCode = 1;
  });
}

export default app;

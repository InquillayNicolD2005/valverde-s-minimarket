import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

export const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(180), allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(40), defaultValue: '' },
  address: { type: DataTypes.STRING(255), defaultValue: '' },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'admin'), allowNull: false, defaultValue: 'customer' }
}, { tableName: 'users' });

export const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING(180), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false, index: true },
  description: { type: DataTypes.STRING(500), defaultValue: '' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(500), defaultValue: 'imagenes/logo.png' },
  stock: { type: DataTypes.INTEGER, defaultValue: 20 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'products' });

export const Offer = sequelize.define('Offer', {
  name: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.STRING(500), defaultValue: '' },
  image: { type: DataTypes.STRING(500), defaultValue: 'imagenes/ofertas/oferta1.png' },
  originalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  offerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  label: { type: DataTypes.STRING(80), defaultValue: 'Oferta' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'offers' });

export const SiteContent = sequelize.define('SiteContent', {
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  content: { type: DataTypes.TEXT, allowNull: false }
}, { tableName: 'site_content' });

export const Order = sequelize.define('Order', {
  customerName: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(255), allowNull: false },
  deliveryTime: { type: DataTypes.STRING(100), defaultValue: 'Lo antes posible' },
  paymentMethod: { type: DataTypes.STRING(80), defaultValue: 'Efectivo' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  deliveryFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'Pendiente' },
  items: { type: DataTypes.JSON, allowNull: false }
}, { tableName: 'orders' });

User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: true } });
Order.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true } });

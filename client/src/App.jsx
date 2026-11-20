import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { api, imageUrl } from './api.js';

const categories = [
  ['abarrotes', 'Abarrotes', '🛒'], ['bebidas', 'Bebidas', '🥤'], ['licores', 'Licores', '🍷'],
  ['lacteos', 'Lácteos', '🥛'], ['frutas', 'Frutas y verduras', '🍎'], ['snacks', 'Snacks', '🍪'],
  ['limpieza', 'Limpieza', '🧼'], ['cuidado', 'Cuidado personal', '🧴'],
  ['mascotas', 'Mascotas', '🐾'], ['medicinas', 'Medicinas', '🩹']
];

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

function Header({ user, cartCount, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
    <div className="announcement"><span>🚚 Entregas disponibles en tu zona</span><Link to="/ofertas">Ver ofertas de la semana&nbsp; →</Link></div>
    <header className="site-header">
      <Link to="/" className="brand"><img src="/imagenes/logo.png" alt="" /><span>VALVERDE’S<small>MINIMARKET · CUSCO</small></span></Link>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">☰</button>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/categoria/abarrotes" onClick={() => setMenuOpen(false)}>Categorías</Link>
        <Link to="/ofertas" onClick={() => setMenuOpen(false)}>Ofertas</Link>
        <Link to="/acerca" onClick={() => setMenuOpen(false)}>Acerca de</Link>
        {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Administrar</Link>}
      </nav>
      <div className="header-actions">
        {user ? <button className="text-button" onClick={logout}>Hola, {user.name.split(' ')[0]} · Salir</button> : <Link className="login-link" to="/login">Iniciar sesión</Link>}
        <Link className="cart-link" to="/carrito" aria-label="Carrito">🛒 <span>{cartCount}</span></Link>
      </div>
    </header>
  </>;
}

function ProductCard({ product, addToCart }) {
  return <article className="product-card">
    <Link to={`/producto/${product.id}`} className="product-image"><img src={imageUrl(product.image)} alt={product.name} loading="lazy" /></Link>
    <div className="product-copy">
      <span className="product-category">{product.category}</span>
      <Link to={`/producto/${product.id}`} className="product-name">{product.name}</Link>
      <p>{product.description || 'Disponible en Valverde’s Minimarket.'}</p>
      <div className="product-bottom"><strong>{money(product.price)}</strong><button className="add-button" onClick={() => addToCart(product)}>Agregar</button></div>
    </div>
  </article>;
}

function ProductGrid({ products, addToCart }) {
  if (!products.length) return <div className="empty-state"><span>🧺</span><h3>No encontramos productos</h3><p>Prueba otra búsqueda o vuelve más tarde.</p></div>;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}</div>;
}

function Home({ products, addToCart }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => query ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())) : products.slice(0, 8), [products, query]);
  return <>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow">TU TIENDA DE CONFIANZA EN CUSCO</span><h1>Lo que necesitas,<br /><em>más cerca de ti.</em></h1><p>Productos frescos, buenos precios y la atención cercana que tu familia merece.</p>
        <div className="search-box"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="¿Qué estás buscando hoy?" /><button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}>Buscar</button></div>
        <div className="hero-perks"><span>✓ Productos seleccionados</span><span>✓ Entrega a domicilio</span></div>
      </div>
      <div className="hero-art"><div className="hero-orbit"></div><img src="/imagenes/tienda.png" alt="Valverde's Minimarket" /><span className="hero-sticker">FRESCO<br />Y CERCA</span></div>
    </section>
    <section className="category-section content-wrap"><div className="section-title"><div><span className="eyebrow">PARA CADA DÍA</span><h2>Explora por categoría</h2></div><Link to="/categoria/abarrotes">Ver catálogo →</Link></div>
      <div className="category-grid">{categories.map(([slug, name, emoji]) => <Link key={slug} to={`/categoria/${slug}`} className="category-tile"><span>{emoji}</span><strong>{name}</strong></Link>)}</div>
    </section>
    <section className="catalog-section content-wrap" id="catalogo"><div className="section-title"><div><span className="eyebrow">{query ? 'RESULTADOS DE BÚSQUEDA' : 'LOS FAVORITOS DE CASA'}</span><h2>{query ? `Buscamos “${query}”` : 'Productos destacados'}</h2></div><Link to="/ofertas">Descubre las ofertas →</Link></div><ProductGrid products={filtered} addToCart={addToCart} /></section>
    <section className="delivery-banner"><span>📍</span><div><strong>Estamos en Cusco, listos para atenderte.</strong><p>Haz tu pedido en línea y recíbelo en casa.</p></div><Link to="/categoria/abarrotes">Comprar ahora →</Link></section>
  </>;
}

function CategoryPage({ products, addToCart }) {
  const { category } = useParams();
  const [query, setQuery] = useState('');
  const selected = categories.find(([slug]) => slug === category);
  const categoryAliases = {
    abarrotes: ['abarrotes'],
    bebidas: ['bebidas'],
    licores: ['licores'],
    lacteos: ['lacteos', 'lácteos'],
    frutas: ['frutas', 'frutas y verduras'],
    snacks: ['snacks'],
    limpieza: ['limpieza'],
    cuidado: ['cuidado', 'cuidado personal'],
    mascotas: ['mascotas'],
    medicinas: ['medicinas', 'salud']
  };
  const normalize = (value) => String(value).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const aliases = (categoryAliases[category] || [category]).map(normalize);
  const results = products.filter((p) =>
    aliases.includes(normalize(p.category).replace(/\s+/g, ' ').trim()) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  return <main className="content-wrap page-section"><div className="breadcrumbs"><Link to="/">Inicio</Link><span>/</span><span>{selected?.[1] || category}</span></div>
    <div className="section-title page-heading"><div><span className="eyebrow">ENCUENTRA TUS FAVORITOS</span><h1>{selected?.[1] || category}</h1></div><label className="inline-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en la categoría" /></label></div>
    <ProductGrid products={results} addToCart={addToCart} /></main>;
}

function Offers({ offers }) {
  return <main className="content-wrap page-section"><div className="section-title page-heading"><div><span className="eyebrow">BUENOS PRECIOS, TODOS LOS DÍAS</span><h1>Ofertas para ti</h1><p>Ahorra con las promociones de esta semana.</p></div></div>
    {offers.length ? <div className="offer-grid">{offers.map((offer) => <article className="offer-card" key={offer.id}><img src={imageUrl(offer.image)} alt={offer.name} /><span className="offer-label">{offer.label}</span><div><h2>{offer.name}</h2><p>{offer.description}</p><strong>{money(offer.offerPrice)}</strong>{Number(offer.originalPrice) > Number(offer.offerPrice) && <del>{money(offer.originalPrice)}</del>}</div></article>)}</div> : <div className="empty-state"><span>✨</span><h3>Muy pronto tendremos nuevas ofertas</h3></div>}
  </main>;
}

function About({ content }) {
  return <main className="content-wrap page-section about-page"><div className="about-hero"><span className="eyebrow">CERCA DE NUESTRA COMUNIDAD</span><h1>Más que una tienda,<br /><em>somos parte de tu día.</em></h1><p>{content.about_hero || 'Desde Cusco trabajamos cada día para llevarte productos esenciales con atención cercana y entregas rápidas.'}</p></div>
    <div className="about-details"><img src="/imagenes/tienda.png" alt="Nuestra tienda" /><div><span className="eyebrow">VALVERDE’S · CUSCO</span><h2>Siempre cerca de casa</h2><p>Creemos que hacer tus compras debe ser sencillo, agradable y accesible. En Valverde’s reunimos todo lo que necesitas para tu hogar, con el trato amable de tu tienda de barrio.</p><div className="mission"><h3>Nuestra misión</h3><p>{content.about_mision}</p></div><div className="mission"><h3>Nuestra visión</h3><p>{content.about_vision}</p></div></div></div>
  </main>;
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const result = await api(path, { method: 'POST', body: JSON.stringify(form) });
      onLogin(result); navigate(result.user.role === 'admin' ? '/admin' : '/');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card"><div className="auth-art"><img src="/imagenes/logo.png" alt="" /><span>Valverde’s<br />siempre cerca.</span></div><div className="auth-form"><span className="eyebrow">BIENVENIDO A CASA</span><h1>{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1><p>{mode === 'login' ? 'Ingresa para hacer tus compras más rápido.' : 'Regístrate y compra todo lo que necesitas.'}</p>
    <form onSubmit={submit}>{mode === 'register' && <label>Nombre completo<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
      <label>{mode === 'login' ? 'Correo o usuario' : 'Correo electrónico'}<input required type="text" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      {mode === 'register' && <label>Teléfono<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>}
      <label>Contraseña<input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      {error && <div className="form-error">{error}</div>}<button className="primary-button full-button" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
    </form><p className="auth-switch">{mode === 'login' ? '¿Aún no tienes una cuenta?' : '¿Ya tienes una cuenta?'} <button onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button></p></div></section></main>;
}

function CartPage({ cart, updateCart, removeFromCart, user }) {
  const [form, setForm] = useState({ customerName: user?.name || '', address: user?.address || '', deliveryTime: 'Lo antes posible', paymentMethod: 'Efectivo' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const placeOrder = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    try {
      const { order } = await api('/orders', { method: 'POST', body: JSON.stringify({ ...form, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) });
      updateCart([]); localStorage.removeItem('valverde-cart'); setMessage(`¡Gracias por tu compra! Tu pedido #${order.id} fue registrado.`); window.scrollTo(0, 0);
    } catch (err) { setError(err.message); }
  };
  return <main className="content-wrap page-section"><div className="section-title page-heading"><div><span className="eyebrow">TU COMPRA</span><h1>Carrito y entrega</h1></div><Link to="/">← Seguir comprando</Link></div>
    {message && <div className="success-message">{message}</div>}
    {!cart.length ? <div className="empty-state"><span>🛒</span><h3>Tu carrito está esperando</h3><p>Explora el catálogo y agrega tus productos favoritos.</p><Link className="primary-button" to="/">Ver productos</Link></div> : <div className="checkout-layout"><section className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><img src={imageUrl(item.image)} alt="" /><div className="cart-item-info"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity"><button onClick={() => updateCart(item.id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button onClick={() => updateCart(item.id, item.quantity + 1)}>+</button></div></div><button className="remove-button" onClick={() => removeFromCart(item.id)}>Quitar</button></article>)}
      <div className="cart-total"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="cart-total"><span>Envío</span><strong>{subtotal >= 50 ? 'Gratis' : money(5)}</strong></div><div className="cart-total grand-total"><span>Total estimado</span><strong>{money(subtotal + (subtotal >= 50 ? 0 : 5))}</strong></div></section>
      <form className="checkout-form" onSubmit={placeOrder}><h2>Datos de entrega</h2><p>Cuéntanos dónde y cómo recibir tu pedido.</p><label>Nombre completo<input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></label><label>Dirección de entrega<input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><label>Horario<select value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}><option>Lo antes posible</option><option>Por la mañana</option><option>Por la tarde</option></select></label><label>Forma de pago<select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}><option>Efectivo</option><option>Yape / Plin</option><option>Tarjeta al recibir</option></select></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full-button">Confirmar pedido · {money(subtotal + (subtotal >= 50 ? 0 : 5))}</button></form></div>}
  </main>;
}

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => { api(`/products/${id}`).then((res) => setProduct(res.product)).catch(() => setProduct(null)); }, [id]);
  if (!product) return <main className="content-wrap page-section empty-state"><h2>Producto no encontrado</h2><Link to="/">Volver al catálogo</Link></main>;
  return <main className="content-wrap page-section"><div className="breadcrumbs"><Link to="/">Inicio</Link><span>/</span><span>{product.name}</span></div><article className="product-detail"><img src={imageUrl(product.image)} alt={product.name} /><div><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><p>{product.description || 'Un producto seleccionado para tu hogar, disponible en Valverde’s Minimarket.'}</p><strong>{money(product.price)}</strong><button className="primary-button" onClick={() => addToCart(product)}>Agregar al carrito</button><small>Entrega disponible en Cusco · Stock: {product.stock}</small></div></article></main>;
}

const emptyProduct = { name: '', category: 'abarrotes', description: '', price: '', image: '', stock: 20 };
const emptyOffer = { name: '', description: '', image: 'imagenes/ofertas/oferta1.png', originalPrice: '', offerPrice: '', label: 'Oferta' };

function Admin({ user }) {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ metrics: {}, products: [], offers: [], users: [], orders: [], content: {} });
  const [product, setProduct] = useState(emptyProduct);
  const [offer, setOffer] = useState(emptyOffer);
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [imported, setImported] = useState('');
  const loadData = async () => {
    try {
      const [dashboard, products, offers, users, orders, about] = await Promise.all([
        api('/dashboard'), api('/products'), api('/offers/admin'), api('/users'), api('/orders'), api('/about')
      ]);
      setData({ metrics: dashboard.metrics, products: products.products, offers: offers.offers, users: users.users, orders: orders.orders, content: about.content });
    } catch (error) { setFailure(error.message); }
  };
  useEffect(() => { loadData(); }, []);
  const save = async (path, method, body) => {
    setNotice(''); setFailure('');
    try { await api(path, { method, body: JSON.stringify(body) }); setNotice('Cambios guardados correctamente.'); await loadData(); }
    catch (error) { setFailure(error.message); }
  };
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;
  const importCatalog = async () => {
    try { const result = await api('/catalog/import', { method: 'POST', body: '{}' }); setImported(`${result.imported} productos importados del catálogo.`); await loadData(); }
    catch (error) { setFailure(error.message); }
  };
  const submitProduct = async (e) => { e.preventDefault(); await save(editingProduct ? `/products/${editingProduct}` : '/products', editingProduct ? 'PUT' : 'POST', { ...product, price: Number(product.price), stock: Number(product.stock) }); setProduct(emptyProduct); setEditingProduct(null); };
  const submitOffer = async (e) => { e.preventDefault(); await save(editingOffer ? `/offers/${editingOffer}` : '/offers', editingOffer ? 'PUT' : 'POST', { ...offer, originalPrice: Number(offer.originalPrice), offerPrice: Number(offer.offerPrice) }); setOffer(emptyOffer); setEditingOffer(null); };
  const menu = [['dashboard', 'Resumen'], ['products', 'Productos'], ['offers', 'Ofertas'], ['orders', 'Pedidos'], ['users', 'Clientes'], ['about', 'Acerca de']];
  return <main className="admin-page"><aside className="admin-sidebar"><div className="admin-mark">V<span>VALVERDE’S</span><small>PANEL DE CONTROL</small></div><nav>{menu.map(([key, title]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{title}</button>)}</nav><Link to="/">← Volver a la tienda</Link></aside>
    <section className="admin-main"><header className="admin-top"><div><span className="eyebrow">MINIMARKET VALVERDE’S</span><h1>{menu.find(([key]) => key === tab)?.[1]}</h1></div><span className="admin-profile">● &nbsp;{user.name}</span></header>
      {notice && <div className="success-message">{notice}</div>}{failure && <div className="form-error">{failure}</div>}
      {tab === 'dashboard' && <><div className="metric-grid">{[['Ventas registradas', money(data.metrics.sales)], ['Pedidos', data.metrics.orders || 0], ['Productos activos', data.metrics.products || 0], ['Clientes', data.metrics.customers || 0]].map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="admin-panel"><div className="section-title"><h2>Catálogo original</h2><button className="primary-button" onClick={importCatalog}>Importar desde PHP</button></div><p>Lee las categorías existentes en categoria_*.html y agrega productos que aún no estén en la base.</p>{imported && <div className="success-message">{imported}</div>}</div><div className="admin-panel"><h2>Pedidos recientes</h2><OrderTable orders={data.orders.slice(0, 5)} updateStatus={(id, status) => save(`/orders/${id}/status`, 'PATCH', { status })} /></div></>}
      {tab === 'products' && <div className="admin-panel"><h2>{editingProduct ? 'Editar producto' : 'Agregar producto'}</h2><form className="admin-form" onSubmit={submitProduct}>{[['name','Nombre'],['category','Categoría'],['description','Descripción'],['price','Precio'],['image','Ruta de imagen'],['stock','Stock']].map(([key,label]) => <label key={key}>{label}<input required={['name','category','price'].includes(key)} type={['price','stock'].includes(key) ? 'number' : 'text'} step={key === 'price' ? '0.01' : undefined} value={product[key]} onChange={(e) => setProduct({ ...product, [key]: e.target.value })} /></label>)}<button className="primary-button">{editingProduct ? 'Guardar producto' : 'Crear producto'}</button></form><ProductTable products={data.products} onEdit={(p) => { setProduct(p); setEditingProduct(p.id); }} onDelete={(id) => save(`/products/${id}`, 'DELETE')} /></div>}
      {tab === 'offers' && <div className="admin-panel"><h2>{editingOffer ? 'Editar oferta' : 'Nueva oferta'}</h2><form className="admin-form" onSubmit={submitOffer}>{[['name','Nombre'],['description','Descripción'],['image','Ruta de imagen'],['originalPrice','Precio original'],['offerPrice','Precio oferta'],['label','Etiqueta']].map(([key,label]) => <label key={key}>{label}<input required={['name','originalPrice','offerPrice'].includes(key)} type={key.toLowerCase().includes('price') ? 'number' : 'text'} step={key.toLowerCase().includes('price') ? '0.01' : undefined} value={offer[key]} onChange={(e) => setOffer({ ...offer, [key]: e.target.value })} /></label>)}<button className="primary-button">{editingOffer ? 'Guardar oferta' : 'Crear oferta'}</button></form><div className="admin-table-wrap"><table><thead><tr><th>Oferta</th><th>Precio</th><th>Etiqueta</th><th>Acciones</th></tr></thead><tbody>{data.offers.map((row) => <tr key={row.id}><td>{row.name}</td><td>{money(row.offerPrice)}</td><td>{row.label}</td><td><button onClick={() => { setOffer(row); setEditingOffer(row.id); }}>Editar</button><button onClick={() => save(`/offers/${row.id}`, 'DELETE')}>Desactivar</button></td></tr>)}</tbody></table></div></div>}
      {tab === 'orders' && <div className="admin-panel"><h2>Pedidos de la tienda</h2><OrderTable orders={data.orders} updateStatus={(id, status) => save(`/orders/${id}/status`, 'PATCH', { status })} /></div>}
      {tab === 'users' && <div className="admin-panel"><h2>Clientes registrados</h2><div className="admin-table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Tipo</th></tr></thead><tbody>{data.users.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.email}</td><td>{row.phone || '—'}</td><td>{row.role}</td></tr>)}</tbody></table></div></div>}
      {tab === 'about' && <div className="admin-panel"><h2>Contenido del sitio</h2><form onSubmit={(e) => { e.preventDefault(); save('/about', 'PUT', data.content); }} className="about-edit">{[['about_hero','Presentación'],['about_mision','Misión'],['about_vision','Visión']].map(([key,label]) => <label key={key}>{label}<textarea rows="4" value={data.content[key] || ''} onChange={(e) => setData({ ...data, content: { ...data.content, [key]: e.target.value } })} /></label>)}<button className="primary-button">Guardar contenido</button></form></div>}
    </section>
  </main>;
}

function ProductTable({ products, onEdit, onDelete }) {
  return <div className="admin-table-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>{products.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.category}</td><td>{money(row.price)}</td><td>{row.stock}</td><td><button onClick={() => onEdit(row)}>Editar</button><button onClick={() => onDelete(row.id)}>Desactivar</button></td></tr>)}</tbody></table></div>;
}

function OrderTable({ orders, updateStatus }) {
  return <div className="admin-table-wrap"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Actualizar</th></tr></thead><tbody>{orders.map((row) => <tr key={row.id}><td>#{row.id}<small>{new Date(row.createdAt).toLocaleDateString('es-PE')}</small></td><td>{row.customerName}</td><td>{money(row.total)}</td><td><span className="status-pill">{row.status}</span></td><td><select value={row.status} onChange={(e) => updateStatus(row.id, e.target.value)}>{['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'].map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Link to="/" className="brand footer-brand"><img src="/imagenes/logo.png" alt="" /><span>VALVERDE’S<small>MINIMARKET · CUSCO</small></span></Link><p>Buenos productos, atención cercana y todo lo que tu hogar necesita.</p><span>© {new Date().getFullYear()} Valverde’s Minimarket · Cusco, Perú</span></div></footer>;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [about, setAbout] = useState({});
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('valverde-user')); } catch { return null; } });
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('valverde-cart')) || []; } catch { return []; } });
  useEffect(() => {
    api('/products').then((result) => setProducts(result.products)).catch(() => setProducts([]));
    api('/offers').then((result) => setOffers(result.offers)).catch(() => setOffers([]));
    api('/about').then((result) => setAbout(result.content)).catch(() => {});
  }, []);
  const saveCart = (next) => { setCart(next); localStorage.setItem('valverde-cart', JSON.stringify(next)); };
  const addToCart = (product) => {
    const found = cart.find((item) => item.id === product.id);
    saveCart(found ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...cart, { ...product, quantity: 1 }]);
  };
  const updateCart = (id, quantity) => saveCart(quantity < 1 ? cart.filter((item) => item.id !== id) : cart.map((item) => item.id === id ? { ...item, quantity: Math.min(99, quantity) } : item));
  const removeFromCart = (id) => saveCart(cart.filter((item) => item.id !== id));
  const setSession = (result) => { localStorage.setItem('valverde-token', result.token); localStorage.setItem('valverde-user', JSON.stringify(result.user)); setUser(result.user); };
  const logout = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch { /* local sign-out remains available if the API is offline */ } localStorage.removeItem('valverde-token'); localStorage.removeItem('valverde-user'); setUser(null); };
  return <><Header user={user} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} logout={logout} /><Routes>
    <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
    <Route path="/categoria/:category" element={<CategoryPage products={products} addToCart={addToCart} />} />
    <Route path="/ofertas" element={<Offers offers={offers} />} />
    <Route path="/acerca" element={<About content={about} />} />
    <Route path="/login" element={<AuthPage onLogin={setSession} />} />
    <Route path="/carrito" element={<CartPage cart={cart} updateCart={updateCart} removeFromCart={removeFromCart} user={user} />} />
    <Route path="/producto/:id" element={<ProductDetail addToCart={addToCart} />} />
    <Route path="/admin" element={<Admin user={user} />} />
    <Route path="*" element={<main className="content-wrap page-section empty-state"><h1>Página no encontrada</h1><Link to="/">Volver al inicio</Link></main>} />
  </Routes><Footer /></>;
}

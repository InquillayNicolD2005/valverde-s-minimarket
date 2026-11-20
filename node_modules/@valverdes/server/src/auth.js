import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'development-only-secret', { expiresIn: '7d' });
}

export function authenticate(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Inicia sesión para continuar.' });
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret');
    next();
  } catch {
    return res.status(401).json({ message: 'La sesión expiró. Inicia sesión nuevamente.' });
  }
}

export function optionalAuthenticate(req, _res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token) {
    try { req.auth = jwt.verify(token, process.env.JWT_SECRET || 'development-only-secret'); } catch { /* allow guest checkout */ }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'admin') return res.status(403).json({ message: 'Se requiere una cuenta administradora.' });
  next();
}

export const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role
});

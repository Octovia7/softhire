// middleware/authorizeAdmin.js

const jwt = require('jsonwebtoken');

const authorizeAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = decoded; // Optional: attach decoded info
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authorizeAdmin;

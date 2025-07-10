const rbac = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  next();
};

module.exports = rbac;

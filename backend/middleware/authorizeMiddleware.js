const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // This should ideally not happen if authMiddleware ran successfully
      // and the user object with a role is attached.
      return res.status(403).json({ message: 'Forbidden: User role not available.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.` });
    }
    next();
  };
};

module.exports = { authorizeRoles };
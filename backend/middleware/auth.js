const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware pour vérifier le token JWT
const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Authentification requise." });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myway_secret');

    // Trouver l'utilisateur correspondant
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    // Ajouter l'utilisateur à l'objet requête
    req.token = token;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide. Veuillez vous reconnecter." });
  }
};

module.exports = auth;

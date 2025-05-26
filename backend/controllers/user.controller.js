const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Contrôleur pour les utilisateurs
const UserController = {
  // Récupérer tous les utilisateurs
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] } // Ne pas renvoyer le mot de passe
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un utilisateur par son ID
  getOne: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] } // Ne pas renvoyer le mot de passe
      });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Créer un nouvel utilisateur (inscription)
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Veuillez fournir un nom d'utilisateur, un email et un mot de passe" });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Cet utilisateur ou cet email existe déjà" });
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer l'utilisateur
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword
      });

      // Créer un token JWT
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username },
        process.env.JWT_SECRET || 'myway_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Connexion utilisateur
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe" });
      }

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ message: "Email ou mot de passe incorrect" });
      }

      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Email ou mot de passe incorrect" });
      }

      // Créer un token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'myway_secret',
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un utilisateur
  update: async (req, res) => {
    try {
      const { username, email } = req.body;

      if (!username && !email) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
      }

      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier que l'utilisateur connecté modifie son propre profil
      if (req.user.id !== user.id) {
        return res.status(403).json({ message: "Non autorisé à modifier ce profil" });
      }

      await user.update({ username, email });
      res.json({
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Supprimer un utilisateur
  delete: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier que l'utilisateur connecté supprime son propre profil
      if (req.user.id !== user.id) {
        return res.status(403).json({ message: "Non autorisé à supprimer ce profil" });
      }

      await user.destroy();
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Obtenir le profil de l'utilisateur connecté
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = UserController;

const User = require('../models/sequelize/user.model');

// Contrôleur pour les utilisateurs
const UserController = {
  // Récupérer tous les utilisateurs
  getAll: async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un utilisateur par son ID
  getOne: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Créer un nouvel utilisateur
  create: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Veuillez fournir un nom d'utilisateur, un email et un mot de passe" });
      }

      const newUser = await User.create({
        username,
        email,
        password
      });
      res.status(201).json(newUser);
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

      await user.update({ username, email });
      res.json(user);
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

      await user.destroy();
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = UserController;

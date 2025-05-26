const db = require('../config/db.config');

// Modèle User
const User = {
  // Récupérer tous les utilisateurs
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  },

  // Trouver un utilisateur par ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Créer un nouvel utilisateur
  create: async (userData) => {
    const { username, email, password } = userData;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return { id: result.insertId, ...userData };
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    const { username, email } = userData;
    await db.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
    return { id, ...userData };
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    return db.query('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = User;


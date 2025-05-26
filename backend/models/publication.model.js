const db = require('../config/db.config');

// Modèle Publication
const Publication = {
  // Récupérer toutes les publications
  findAll: async () => {
    const [rows] = await db.query(`
      SELECT p.*, u.username as author_name 
      FROM publications p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  // Trouver une publication par ID
  findById: async (id) => {
    const [rows] = await db.query(`
      SELECT p.*, u.username as author_name 
      FROM publications p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  },

  // Créer une nouvelle publication
  create: async (pubData) => {
    const { title, content, user_id, location } = pubData;
    const [result] = await db.query(
      'INSERT INTO publications (title, content, user_id, location) VALUES (?, ?, ?, ?)',
      [title, content, user_id, location]
    );
    return { id: result.insertId, ...pubData, created_at: new Date() };
  },

  // Mettre à jour une publication
  update: async (id, pubData) => {
    const { title, content, location } = pubData;
    await db.query(
      'UPDATE publications SET title = ?, content = ?, location = ? WHERE id = ?',
      [title, content, location, id]
    );
    return { id, ...pubData };
  },

  // Supprimer une publication
  delete: async (id) => {
    return db.query('DELETE FROM publications WHERE id = ?', [id]);
  },

  // Récupérer les publications d'un utilisateur
  findByUserId: async (userId) => {
    const [rows] = await db.query(`
      SELECT p.*, u.username as author_name 
      FROM publications p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    return rows;
  }
};

module.exports = Publication;

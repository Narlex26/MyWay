const db = require('../config/db.config');

// Modèle Comment
const Comment = {
  // Récupérer tous les commentaires d'une publication
  findByPublicationId: async (publicationId) => {
    const [rows] = await db.query(`
      SELECT c.*, u.username as author_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.publication_id = ? 
      ORDER BY c.created_at DESC
    `, [publicationId]);
    return rows;
  },

  // Trouver un commentaire par ID
  findById: async (id) => {
    const [rows] = await db.query(`
      SELECT c.*, u.username as author_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  },

  // Créer un nouveau commentaire
  create: async (commentData) => {
    const { content, user_id, publication_id } = commentData;
    const [result] = await db.query(
      'INSERT INTO comments (content, user_id, publication_id) VALUES (?, ?, ?)',
      [content, user_id, publication_id]
    );
    return { id: result.insertId, ...commentData, created_at: new Date() };
  },

  // Mettre à jour un commentaire
  update: async (id, commentData) => {
    const { content } = commentData;
    await db.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );
    return { id, ...commentData };
  },

  // Supprimer un commentaire
  delete: async (id) => {
    return db.query('DELETE FROM comments WHERE id = ?', [id]);
  }
};

module.exports = Comment;

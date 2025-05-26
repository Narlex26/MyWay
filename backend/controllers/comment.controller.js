const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Publication = require('../models/publication.model');

// Contrôleur pour les commentaires
const CommentController = {
  // Récupérer tous les commentaires d'une publication
  getByPublication: async (req, res) => {
    try {
      const comments = await Comment.findAll({
        where: { publication_id: req.params.publicationId },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'DESC']]
      });

      // Formater les données pour correspondre à l'API précédente
      const formattedComments = comments.map(comment => {
        const commentJson = comment.toJSON();
        return {
          ...commentJson,
          author_name: commentJson.author ? commentJson.author.username : null
        };
      });

      res.json(formattedComments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un commentaire par son ID
  getOne: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      // Formater les données pour correspondre à l'API précédente
      const commentJson = comment.toJSON();
      const formattedComment = {
        ...commentJson,
        author_name: commentJson.author ? commentJson.author.username : null
      };

      res.json(formattedComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Créer un nouveau commentaire - Requiert authentification
  create: async (req, res) => {
    try {
      const { content, publication_id } = req.body;

      if (!content || !publication_id) {
        return res.status(400).json({ message: "Veuillez fournir un contenu et un ID de publication" });
      }

      // Utilise l'ID de l'utilisateur connecté depuis le middleware d'authentification
      const user_id = req.user.id;

      // Vérifier que la publication existe
      const publication = await Publication.findByPk(publication_id);
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      const newComment = await Comment.create({
        content,
        user_id,
        publication_id
      });

      // Récupérer le commentaire créé avec les informations de l'auteur
      const comment = await Comment.findByPk(newComment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      const commentJson = comment.toJSON();
      const formattedComment = {
        ...commentJson,
        author_name: commentJson.author ? commentJson.author.username : null
      };

      res.status(201).json(formattedComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un commentaire - Requiert authentification et vérification de propriété
  update: async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
      }

      const comment = await Comment.findByPk(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire du commentaire
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à modifier ce commentaire" });
      }

      await comment.update({ content });

      // Récupérer le commentaire mis à jour avec les informations de l'auteur
      const updatedComment = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      const commentJson = updatedComment.toJSON();
      const formattedComment = {
        ...commentJson,
        author_name: commentJson.author ? commentJson.author.username : null
      };

      res.json(formattedComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Supprimer un commentaire - Requiert authentification et vérification de propriété
  delete: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire du commentaire
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à supprimer ce commentaire" });
      }

      await comment.destroy();
      res.json({ message: "Commentaire supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer tous les commentaires de l'utilisateur connecté
  getMyComments: async (req, res) => {
    try {
      const comments = await Comment.findAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          },
          {
            model: Publication,
            as: 'publication',
            attributes: ['id', 'title']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Formater les données
      const formattedComments = comments.map(comment => {
        const commentJson = comment.toJSON();
        return {
          ...commentJson,
          author_name: commentJson.author ? commentJson.author.username : null,
          publication_title: commentJson.publication ? commentJson.publication.title : null
        };
      });

      res.json(formattedComments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = CommentController;

const Publication = require('../models/publication.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');

// Contrôleur pour les publications
const PublicationController = {
  // Récupérer toutes les publications
  getAll: async (req, res) => {
    try {
      const publications = await Publication.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'DESC']]
      });

      // Formater les données pour correspondre à l'API précédente
      const formattedPublications = publications.map(pub => {
        const pubJson = pub.toJSON();
        return {
          ...pubJson,
          author_name: pubJson.author ? pubJson.author.username : null
        };
      });

      res.json(formattedPublications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer une publication par son ID
  getOne: async (req, res) => {
    try {
      const publication = await Publication.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      // Formater les données pour correspondre à l'API précédente
      const pubJson = publication.toJSON();
      const formattedPublication = {
        ...pubJson,
        author_name: pubJson.author ? pubJson.author.username : null
      };

      res.json(formattedPublication);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Créer une nouvelle publication - Requiert authentification
  create: async (req, res) => {
    try {
      const { title, content, location } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: "Veuillez fournir un titre et un contenu" });
      }

      // Utilise l'ID de l'utilisateur connecté depuis le middleware d'authentification
      const user_id = req.user.id;

      const newPublication = await Publication.create({
        title,
        content,
        user_id,
        location: location || null
      });

      // Récupérer la publication créée avec les informations de l'auteur
      const publication = await Publication.findByPk(newPublication.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      const pubJson = publication.toJSON();
      const formattedPublication = {
        ...pubJson,
        author_name: pubJson.author ? pubJson.author.username : null
      };

      res.status(201).json(formattedPublication);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour une publication - Requiert authentification et vérification de propriété
  update: async (req, res) => {
    try {
      const { title, content, location } = req.body;

      if (!title && !content && !location) {
        return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
      }

      const publication = await Publication.findByPk(req.params.id);
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire de la publication
      if (publication.user_id !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à modifier cette publication" });
      }

      await publication.update({
        title: title || publication.title,
        content: content || publication.content,
        location: location !== undefined ? location : publication.location
      });

      // Récupérer la publication mise à jour avec les informations de l'auteur
      const updatedPublication = await Publication.findByPk(publication.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });

      const pubJson = updatedPublication.toJSON();
      const formattedPublication = {
        ...pubJson,
        author_name: pubJson.author ? pubJson.author.username : null
      };

      res.json(formattedPublication);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Supprimer une publication - Requiert authentification et vérification de propriété
  delete: async (req, res) => {
    try {
      const publication = await Publication.findByPk(req.params.id);
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      // Vérifier que l'utilisateur connecté est le propriétaire de la publication
      if (publication.user_id !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé à supprimer cette publication" });
      }

      await publication.destroy();
      res.json({ message: "Publication supprimée avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les publications d'un utilisateur
  getByUser: async (req, res) => {
    try {
      const publications = await Publication.findAll({
        where: { user_id: req.params.userId },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'DESC']]
      });

      // Formater les données pour correspondre à l'API précédente
      const formattedPublications = publications.map(pub => {
        const pubJson = pub.toJSON();
        return {
          ...pubJson,
          author_name: pubJson.author ? pubJson.author.username : null
        };
      });

      res.json(formattedPublications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les publications de l'utilisateur connecté
  getMyPublications: async (req, res) => {
    try {
      const publications = await Publication.findAll({
        where: { user_id: req.user.id },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'DESC']]
      });

      // Formater les données pour correspondre à l'API précédente
      const formattedPublications = publications.map(pub => {
        const pubJson = pub.toJSON();
        return {
          ...pubJson,
          author_name: pubJson.author ? pubJson.author.username : null
        };
      });

      res.json(formattedPublications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = PublicationController;

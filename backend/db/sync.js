const sequelize = require('./config/db.config');
const User = require('./models/user.model');
const Publication = require('./models/publication.model');
const Comment = require('./models/comment.model');
const bcrypt = require('bcryptjs');

// Fonction pour synchroniser tous les modèles avec la base de données
const syncDatabase = async () => {
  try {
    console.log('Démarrage de la synchronisation de la base de données...');

    // Options de synchronisation (force: true recréera les tables)
    const options = {
      force: false, // Mettre à true pour recréer toutes les tables (attention: supprime toutes les données existantes)
      alter: true   // Mettre à true pour adapter les tables aux changements des modèles
    };

    // Synchroniser tous les modèles
    await sequelize.sync(options);
    console.log('La synchronisation de la base de données est terminée avec succès.');

    // Si on a recréé les tables, on peut ajouter des données d'exemple
    if (options.force) {
      console.log('Ajout de données exemples...');
      await addSampleData();
      console.log('Données exemples ajoutées avec succès.');
    }

  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
  }
};

// Fonction pour ajouter des données d'exemple si les tables sont vides
const addSampleData = async () => {
  // Créer les utilisateurs exemples
  const salt = await bcrypt.genSalt(10);
  const users = await User.bulkCreate([
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', salt)
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password456', salt)
    },
    {
      username: 'alice_wonder',
      email: 'alice@example.com',
      password: await bcrypt.hash('password789', salt)
    }
  ]);

  // Créer les publications exemples
  const publications = await Publication.bulkCreate([
    {
      title: 'Voyage à Paris',
      content: 'J\'ai visité la tour Eiffel et les Champs-Élysées. C\'était magnifique!',
      location: 'Paris, France',
      user_id: users[0].id
    },
    {
      title: 'Randonnée dans les Alpes',
      content: 'Une superbe expérience en montagne avec des paysages à couper le souffle.',
      location: 'Alpes, France',
      user_id: users[1].id
    },
    {
      title: 'Week-end à Barcelone',
      content: 'Découverte de la Sagrada Familia et promenade sur Las Ramblas.',
      location: 'Barcelone, Espagne',
      user_id: users[2].id
    }
  ]);

  // Créer les commentaires exemples
  await Comment.bulkCreate([
    {
      content: 'Superbe ! J\'adore Paris aussi.',
      user_id: users[1].id,
      publication_id: publications[0].id
    },
    {
      content: 'As-tu visité le Louvre ?',
      user_id: users[2].id,
      publication_id: publications[0].id
    },
    {
      content: 'Les montagnes sont magnifiques en cette saison !',
      user_id: users[0].id,
      publication_id: publications[1].id
    },
    {
      content: 'J\'aimerais y aller aussi !',
      user_id: users[2].id,
      publication_id: publications[1].id
    },
    {
      content: 'Barcelone est ma ville préférée !',
      user_id: users[0].id,
      publication_id: publications[2].id
    }
  ]);
};

// Exécute la synchronisation
syncDatabase();

module.exports = { syncDatabase };

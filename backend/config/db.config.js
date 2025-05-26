// Configuration de la connexion à la base de données avec Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Création d'une instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'myway_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false // Désactiver les logs SQL en production
  }
);

// Tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
};

testConnection();

// Export de l'instance Sequelize
module.exports = sequelize;

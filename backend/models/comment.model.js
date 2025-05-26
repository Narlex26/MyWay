const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Publication = require('./publication.model');

// Définition du modèle Comment avec Sequelize
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  publication_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Publication,
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'comments',
  timestamps: false // Désactive les timestamp automatiques de Sequelize
});

// Définir les relations
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

Comment.belongsTo(Publication, {
  foreignKey: 'publication_id',
  as: 'publication'
});

User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments'
});

Publication.hasMany(Comment, {
  foreignKey: 'publication_id',
  as: 'comments'
});

module.exports = Comment;

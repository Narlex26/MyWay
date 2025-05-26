-- Script SQL complet pour initialiser la base de données distante my_way_db
-- À exécuter sur le serveur: 85.215.203.115
-- Utilisateur: my_way
-- Base de données: my_way_db

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS my_way_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE my_way_db;

-- Suppression des tables existantes si elles existent pour éviter les conflits
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS publications;
DROP TABLE IF EXISTS users;

-- Table des utilisateurs
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des publications
CREATE TABLE publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  location VARCHAR(100),
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des commentaires
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  publication_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données d'exemple - Utilisateurs avec mots de passe hachés (bcrypt)
-- Note: Tous les mots de passe sont 'password123' pour test
INSERT INTO users (username, email, password) VALUES
('john_doe', 'john@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'),
('jane_smith', 'jane@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa'),
('alice_wonder', 'alice@example.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa');

-- Insertion de données d'exemple - Publications
INSERT INTO publications (title, content, location, user_id) VALUES
('Voyage à Paris', 'J\'ai visité la tour Eiffel et les Champs-Élysées. C\'était magnifique!', 'Paris, France', 1),
('Randonnée dans les Alpes', 'Une superbe expérience en montagne avec des paysages à couper le souffle.', 'Alpes, France', 2),
('Week-end à Barcelone', 'Découverte de la Sagrada Familia et promenade sur Las Ramblas.', 'Barcelone, Espagne', 3);

-- Insertion de données d'exemple - Commentaires
INSERT INTO comments (content, user_id, publication_id) VALUES
('Superbe ! J\'adore Paris aussi.', 2, 1),
('As-tu visité le Louvre ?', 3, 1),
('Les montagnes sont magnifiques en cette saison !', 1, 2),
('J\'aimerais y aller aussi !', 3, 2),
('Barcelone est ma ville préférée !', 1, 3);

-- Création d'un index pour améliorer les performances des requêtes fréquentes
CREATE INDEX idx_user_publications ON publications(user_id);
CREATE INDEX idx_publication_comments ON comments(publication_id);

-- Accorder tous les privilèges à l'utilisateur my_way
GRANT ALL PRIVILEGES ON my_way_db.* TO 'my_way'@'%' IDENTIFIED BY 'my_way';
FLUSH PRIVILEGES;

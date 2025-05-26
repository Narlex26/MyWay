-- Script SQL pour initialiser la base de données MyWay

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS myway_db;
USE myway_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des publications
CREATE TABLE IF NOT EXISTS publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  location VARCHAR(100),
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  publication_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
);

-- Insertion de données exemples pour les utilisateurs
INSERT INTO users (username, email, password) VALUES
('john_doe', 'john@example.com', 'password123'),
('jane_smith', 'jane@example.com', 'password456'),
('alice_wonder', 'alice@example.com', 'password789');

-- Insertion de données exemples pour les publications
INSERT INTO publications (title, content, location, user_id) VALUES
('Voyage à Paris', 'J\'ai visité la tour Eiffel et les Champs-Élysées. C\'était magnifique!', 'Paris, France', 1),
('Randonnée dans les Alpes', 'Une superbe expérience en montagne avec des paysages à couper le souffle.', 'Alpes, France', 2),
('Week-end à Barcelone', 'Découverte de la Sagrada Familia et promenade sur Las Ramblas.', 'Barcelone, Espagne', 3);

-- Insertion de données exemples pour les commentaires
INSERT INTO comments (content, user_id, publication_id) VALUES
('Superbe ! J\'adore Paris aussi.', 2, 1),
('As-tu visité le Louvre ?', 3, 1),
('Les montagnes sont magnifiques en cette saison !', 1, 2),
('J\'aimerais y aller aussi !', 3, 2),
('Barcelone est ma ville préférée !', 1, 3);

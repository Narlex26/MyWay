const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import des routes
const userRoutes = require('./routes/user.routes');
const publicationRoutes = require('./routes/publication.routes');
const commentRoutes = require('./routes/comment.routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration des middlewares
app.use(cors()); // Permet les requêtes cross-origin
app.use(express.json()); // Parse les requêtes JSON

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API backend!' });
});

// Route de test pour vérifier la santé de l'API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        version: '1.0.0'
    });
});

// Enregistrement des routes API
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/comments', commentRoutes);

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});


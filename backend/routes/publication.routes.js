const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');
const auth = require('../middleware/auth');

// Routes publiques
router.get('/', publicationController.getAll);
router.get('/:id', publicationController.getOne);
router.get('/user/:userId', publicationController.getByUser);

// Routes protégées par authentification
router.post('/', auth, publicationController.create);
router.put('/:id', auth, publicationController.update);
router.delete('/:id', auth, publicationController.delete);
router.get('/me/publications', auth, publicationController.getMyPublications);

module.exports = router;

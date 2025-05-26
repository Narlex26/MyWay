const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');

// Routes pour les publications
router.get('/', publicationController.getAll);
router.get('/:id', publicationController.getOne);
router.post('/', publicationController.create);
router.put('/:id', publicationController.update);
router.delete('/:id', publicationController.delete);
router.get('/user/:userId', publicationController.getByUser);

module.exports = router;

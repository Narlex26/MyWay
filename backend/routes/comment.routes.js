const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

// Routes pour les commentaires
router.get('/publication/:publicationId', commentController.getByPublication);
router.get('/:id', commentController.getOne);
router.post('/', commentController.create);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const auth = require('../middleware/auth');

// Routes publiques
router.get('/publication/:publicationId', commentController.getByPublication);
router.get('/:id', commentController.getOne);

// Routes protégées par authentification
router.post('/', auth, commentController.create);
router.put('/:id', auth, commentController.update);
router.delete('/:id', auth, commentController.delete);
router.get('/me/comments', auth, commentController.getMyComments);

module.exports = router;

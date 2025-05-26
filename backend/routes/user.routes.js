const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/', userController.getAll);
router.get('/:id', userController.getOne);

// Routes protégées par authentification
router.get('/me/profile', auth, userController.getCurrentUser);
router.put('/:id', auth, userController.update);
router.delete('/:id', auth, userController.delete);

module.exports = router;

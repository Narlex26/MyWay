const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const express = require('express');
const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Création d'une app Express pour les tests
const app = express();

// Configuration minimale de l'app pour les tests
app.use(express.json());

// Configuration des routes de test
// Routes utilisateur
app.get('/api/users', (req, res) => {
  User.findAll()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: err.message }));
});

app.get('/api/users/:id', (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Veuillez fournir un nom d'utilisateur, un email et un mot de passe" });
  }

  User.findOne({ where: { username } })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).json({ message: "L'utilisateur existe déjà" });
      }

      return User.create({ username, email, password: bcrypt.hashSync(password, 8) });
    })
    .then(user => {
      if (user) {
        res.status(201).json({
          message: "Utilisateur enregistré avec succès",
          user: { id: user.id, username: user.username, email: user.email }
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({ where: { username } })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }

      const token = jwt.sign({ id: user.id }, 'your-secret-key', { expiresIn: '24h' });
      res.status(200).json({
        message: "Connexion réussie",
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

chai.use(chaiHttp);

describe('User Controller Tests', () => {
  let userStub;

  beforeEach(() => {
    // Créer des stubs pour les méthodes Sequelize
    userStub = {
      findAll: sinon.stub(User, 'findAll'),
      findByPk: sinon.stub(User, 'findByPk'),
      findOne: sinon.stub(User, 'findOne'),
      create: sinon.stub(User, 'create'),
      update: sinon.stub(User, 'update'),
      destroy: sinon.stub(User, 'destroy')
    };
  });

  afterEach(() => {
    // Restaurer tous les stubs pour éviter les effets secondaires entre les tests
    sinon.restore();
  });

  describe('GET /api/users', () => {
    it('devrait renvoyer tous les utilisateurs', (done) => {
      const usersData = [
        { id: 1, username: 'test1', email: 'test1@example.com' },
        { id: 2, username: 'test2', email: 'test2@example.com' }
      ];

      userStub.findAll.resolves(usersData);

      chai.request(app)
        .get('/api/users')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(2);
          expect(res.body[0]).to.have.property('username', 'test1');
          done();
        });
    });

    it('devrait gérer les erreurs lors de la récupération des utilisateurs', (done) => {
      userStub.findAll.rejects(new Error('Erreur de base de données'));

      chai.request(app)
        .get('/api/users')
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('GET /api/users/:id', () => {
    it('devrait renvoyer un utilisateur par son ID', (done) => {
      const userData = { id: 1, username: 'test1', email: 'test1@example.com' };

      userStub.findByPk.resolves(userData);

      chai.request(app)
        .get('/api/users/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('username', 'test1');
          done();
        });
    });

    it('devrait renvoyer 404 si l\'utilisateur n\'existe pas', (done) => {
      userStub.findByPk.resolves(null);

      chai.request(app)
        .get('/api/users/999')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message', 'Utilisateur non trouvé');
          done();
        });
    });
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', (done) => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123'
      };

      const createdUser = {
        id: 1,
        username: 'newuser',
        email: 'newuser@example.com',
        password: bcrypt.hashSync('Password123', 8)
      };

      userStub.findOne.resolves(null);
      userStub.create.resolves(createdUser);

      chai.request(app)
        .post('/api/auth/register')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message').that.includes('enregistré');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('username', 'newuser');
          done();
        });
    });

    it('devrait renvoyer 400 si les données sont manquantes', (done) => {
      const incompleteUser = { username: 'incomplete' };

      chai.request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('devrait renvoyer 400 si l\'utilisateur existe déjà', (done) => {
      const existingUser = {
        username: 'existing',
        email: 'existing@example.com',
        password: 'Password123'
      };

      userStub.findOne.resolves(existingUser);

      chai.request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message').that.includes('existe déjà');
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', (done) => {
      const loginData = {
        username: 'testuser',
        password: 'Password123'
      };

      const foundUser = {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password123', 8)
      };

      userStub.findOne.resolves(foundUser);

      // Stub pour jwt.sign
      const tokenStub = sinon.stub(jwt, 'sign').returns('fake-token');

      chai.request(app)
        .post('/api/auth/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          done();
        });
    });

    it('devrait renvoyer 401 avec des identifiants invalides', (done) => {
      const loginData = {
        username: 'testuser',
        password: 'WrongPassword'
      };

      const foundUser = {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        password: bcrypt.hashSync('Password123', 8)
      };

      userStub.findOne.resolves(foundUser);

      chai.request(app)
        .post('/api/auth/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').that.includes('Mot de passe');
          done();
        });
    });

    it('devrait renvoyer 404 si l\'utilisateur n\'existe pas', (done) => {
      const loginData = {
        username: 'nonexisting',
        password: 'Password123'
      };

      userStub.findOne.resolves(null);

      chai.request(app)
        .post('/api/auth/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });
});

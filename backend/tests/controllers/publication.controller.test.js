const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const express = require('express');
const Publication = require('../../models/publication.model');
const User = require('../../models/user.model');

// Création d'une app Express pour les tests
const app = express();

// Configuration minimale de l'app pour les tests
app.use(express.json());

// Configuration des routes de test
// Routes publication
app.get('/api/publications', (req, res) => {
  Publication.findAll()
    .then(publications => res.json(publications))
    .catch(err => res.status(500).json({ message: err.message }));
});

app.get('/api/publications/:id', (req, res) => {
  Publication.findByPk(req.params.id)
    .then(publication => {
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }
      res.json(publication);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post('/api/publications', (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content || !userId) {
    return res.status(400).json({ message: "Titre, contenu et identifiant de l'utilisateur requis" });
  }

  User.findByPk(userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      return Publication.create({ title, content, userId });
    })
    .then(publication => {
      if (publication) {
        res.status(201).json({
          message: "Publication créée avec succès",
          publication
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.put('/api/publications/:id', (req, res) => {
  const { title, content } = req.body;
  const userId = 1; // Simulé pour les tests

  Publication.findByPk(req.params.id)
    .then(publication => {
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      if (publication.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette publication" });
      }

      return Publication.update({ title, content }, {
        where: { id: req.params.id },
        returning: true
      });
    })
    .then(([updated, [updatedPublication]]) => {
      if (updated) {
        res.status(200).json({
          message: "Publication mise à jour avec succès",
          publication: updatedPublication
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.delete('/api/publications/:id', (req, res) => {
  const userId = 1; // Simulé pour les tests

  Publication.findByPk(req.params.id)
    .then(publication => {
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      if (publication.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette publication" });
      }

      return Publication.destroy({ where: { id: req.params.id } });
    })
    .then(() => {
      res.status(200).json({ message: "Publication supprimée avec succès" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

chai.use(chaiHttp);

describe('Publication Controller Tests', () => {
  let publicationStub;
  let userStub;

  beforeEach(() => {
    // Créer des stubs pour les méthodes Sequelize
    publicationStub = {
      findAll: sinon.stub(Publication, 'findAll'),
      findByPk: sinon.stub(Publication, 'findByPk'),
      create: sinon.stub(Publication, 'create'),
      update: sinon.stub(Publication, 'update'),
      destroy: sinon.stub(Publication, 'destroy')
    };

    userStub = {
      findByPk: sinon.stub(User, 'findByPk')
    };
  });

  afterEach(() => {
    // Restaurer tous les stubs
    sinon.restore();
  });

  describe('GET /api/publications', () => {
    it('devrait récupérer toutes les publications', (done) => {
      const publicationsData = [
        {
          id: 1,
          title: 'Publication 1',
          content: 'Contenu de la publication 1',
          userId: 1,
          created_at: new Date()
        },
        {
          id: 2,
          title: 'Publication 2',
          content: 'Contenu de la publication 2',
          userId: 2,
          created_at: new Date()
        }
      ];

      publicationStub.findAll.resolves(publicationsData);

      chai.request(app)
        .get('/api/publications')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(2);
          expect(res.body[0]).to.have.property('title', 'Publication 1');
          done();
        });
    });

    it('devrait gérer les erreurs lors de la récupération des publications', (done) => {
      publicationStub.findAll.rejects(new Error('Erreur de base de données'));

      chai.request(app)
        .get('/api/publications')
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('GET /api/publications/:id', () => {
    it('devrait récupérer une publication par son ID', (done) => {
      const publicationData = {
        id: 1,
        title: 'Publication 1',
        content: 'Contenu de la publication 1',
        userId: 1,
        created_at: new Date()
      };

      publicationStub.findByPk.resolves(publicationData);

      chai.request(app)
        .get('/api/publications/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('title', 'Publication 1');
          done();
        });
    });

    it('devrait renvoyer 404 si la publication n\'existe pas', (done) => {
      publicationStub.findByPk.resolves(null);

      chai.request(app)
        .get('/api/publications/999')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });

  describe('POST /api/publications', () => {
    it('devrait créer une nouvelle publication', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const newPublication = {
        title: 'Nouvelle Publication',
        content: 'Contenu de la nouvelle publication',
        userId: 1
      };

      const createdPublication = {
        id: 1,
        title: 'Nouvelle Publication',
        content: 'Contenu de la nouvelle publication',
        userId: 1,
        created_at: new Date()
      };

      userStub.findByPk.resolves({ id: 1, username: 'testuser' });
      publicationStub.create.resolves(createdPublication);

      chai.request(app)
        .post('/api/publications')
        .set('Authorization', token)
        .send(newPublication)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message').that.includes('créée');
          expect(res.body).to.have.property('publication');
          expect(res.body.publication).to.have.property('title', 'Nouvelle Publication');
          done();
        });
    });

    it('devrait renvoyer 400 si des données sont manquantes', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const incompletePublication = { title: 'Titre sans contenu' };

      chai.request(app)
        .post('/api/publications')
        .set('Authorization', token)
        .send(incompletePublication)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('PUT /api/publications/:id', () => {
    it('devrait mettre à jour une publication existante', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const updateData = {
        title: 'Titre Mis à Jour',
        content: 'Contenu mis à jour'
      };

      const originalPublication = {
        id: 1,
        title: 'Ancien Titre',
        content: 'Ancien contenu',
        userId: 1
      };

      const updatedPublication = {
        id: 1,
        title: 'Titre Mis à Jour',
        content: 'Contenu mis à jour',
        userId: 1
      };

      publicationStub.findByPk.resolves(originalPublication);
      publicationStub.update.resolves([1, [updatedPublication]]);

      chai.request(app)
        .put('/api/publications/1')
        .set('Authorization', token)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').that.includes('mise à jour');
          expect(res.body).to.have.property('publication');
          done();
        });
    });

    it('devrait renvoyer 404 si la publication n\'existe pas', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const updateData = {
        title: 'Titre Mis à Jour',
        content: 'Contenu mis à jour'
      };

      publicationStub.findByPk.resolves(null);

      chai.request(app)
        .put('/api/publications/999')
        .set('Authorization', token)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });

    it('devrait renvoyer 403 si l\'utilisateur n\'est pas autorisé', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const updateData = {
        title: 'Titre Mis à Jour',
        content: 'Contenu mis à jour'
      };

      const publication = {
        id: 1,
        title: 'Ancien Titre',
        content: 'Ancien contenu',
        userId: 2 // Différent de l'utilisateur authentifié
      };

      publicationStub.findByPk.resolves(publication);

      chai.request(app)
        .put('/api/publications/1')
        .set('Authorization', token)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('message').that.includes('autorisé');
          done();
        });
    });
  });

  describe('DELETE /api/publications/:id', () => {
    it('devrait supprimer une publication', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé

      const publication = {
        id: 1,
        title: 'Publication à supprimer',
        content: 'Contenu de la publication',
        userId: 1
      };

      publicationStub.findByPk.resolves(publication);
      publicationStub.destroy.resolves(1);

      chai.request(app)
        .delete('/api/publications/1')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').that.includes('supprimé');
          done();
        });
    });

    it('devrait renvoyer 404 si la publication n\'existe pas', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé

      publicationStub.findByPk.resolves(null);

      chai.request(app)
        .delete('/api/publications/999')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });
});

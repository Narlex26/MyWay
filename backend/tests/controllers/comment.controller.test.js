const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = chai;
const express = require('express');
const Comment = require('../../models/comment.model');
const Publication = require('../../models/publication.model');
const User = require('../../models/user.model');

// Création d'une app Express pour les tests
const app = express();

// Configuration minimale de l'app pour les tests
app.use(express.json());

// Configuration des routes de test
// Routes commentaires
app.get('/api/publications/:publicationId/comments', (req, res) => {
  // Vérifier si la publication existe
  Publication.findByPk(req.params.publicationId)
    .then(publication => {
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      // Récupérer les commentaires de la publication
      return Comment.findAll({
        where: { publicationId: req.params.publicationId },
        order: [['created_at', 'DESC']]
      });
    })
    .then(comments => {
      if (comments) res.json(comments);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.get('/api/comments/:id', (req, res) => {
  Comment.findByPk(req.params.id)
    .then(comment => {
      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }
      res.json(comment);
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post('/api/publications/:publicationId/comments', (req, res) => {
  const { content } = req.body;
  const userId = 1; // Simulé pour les tests

  if (!content) {
    return res.status(400).json({ message: "Le contenu du commentaire est requis" });
  }

  // Vérifier si la publication existe
  Publication.findByPk(req.params.publicationId)
    .then(publication => {
      if (!publication) {
        return res.status(404).json({ message: "Publication non trouvée" });
      }

      // Vérifier si l'utilisateur existe
      return User.findByPk(userId);
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Créer le commentaire
      return Comment.create({
        content,
        publicationId: parseInt(req.params.publicationId),
        userId
      });
    })
    .then(comment => {
      res.status(201).json({
        message: "Commentaire créé avec succès",
        comment
      });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.put('/api/comments/:id', (req, res) => {
  const { content } = req.body;
  const userId = 1; // Simulé pour les tests

  Comment.findByPk(req.params.id)
    .then(comment => {
      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce commentaire" });
      }

      return Comment.update({ content }, {
        where: { id: req.params.id },
        returning: true
      });
    })
    .then(([updated, [updatedComment]]) => {
      if (updated) {
        res.status(200).json({
          message: "Commentaire mis à jour avec succès",
          comment: updatedComment
        });
      }
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.delete('/api/comments/:id', (req, res) => {
  const userId = 1; // Simulé pour les tests

  Comment.findByPk(req.params.id)
    .then(comment => {
      if (!comment) {
        return res.status(404).json({ message: "Commentaire non trouvé" });
      }

      if (comment.userId !== userId) {
        return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce commentaire" });
      }

      return Comment.destroy({ where: { id: req.params.id } });
    })
    .then(() => {
      res.status(200).json({ message: "Commentaire supprimé avec succès" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

chai.use(chaiHttp);

describe('Comment Controller Tests', () => {
  let commentStub;
  let publicationStub;
  let userStub;

  beforeEach(() => {
    // Créer des stubs pour les méthodes Sequelize
    commentStub = {
      findAll: sinon.stub(Comment, 'findAll'),
      findByPk: sinon.stub(Comment, 'findByPk'),
      create: sinon.stub(Comment, 'create'),
      update: sinon.stub(Comment, 'update'),
      destroy: sinon.stub(Comment, 'destroy')
    };

    publicationStub = {
      findByPk: sinon.stub(Publication, 'findByPk')
    };

    userStub = {
      findByPk: sinon.stub(User, 'findByPk')
    };
  });

  afterEach(() => {
    // Restaurer tous les stubs
    sinon.restore();
  });

  describe('GET /api/publications/:publicationId/comments', () => {
    it('devrait récupérer tous les commentaires d\'une publication', (done) => {
      const commentsData = [
        {
          id: 1,
          content: 'Premier commentaire',
          publicationId: 1,
          userId: 1,
          created_at: new Date()
        },
        {
          id: 2,
          content: 'Second commentaire',
          publicationId: 1,
          userId: 2,
          created_at: new Date()
        }
      ];

      publicationStub.findByPk.resolves({ id: 1, title: 'Publication test' });
      commentStub.findAll.resolves(commentsData);

      chai.request(app)
        .get('/api/publications/1/comments')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(2);
          expect(res.body[0]).to.have.property('content', 'Premier commentaire');
          done();
        });
    });

    it('devrait renvoyer 404 si la publication n\'existe pas', (done) => {
      publicationStub.findByPk.resolves(null);

      chai.request(app)
        .get('/api/publications/999/comments')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });

  describe('GET /api/comments/:id', () => {
    it('devrait récupérer un commentaire par son ID', (done) => {
      const commentData = {
        id: 1,
        content: 'Commentaire test',
        publicationId: 1,
        userId: 1,
        created_at: new Date()
      };

      commentStub.findByPk.resolves(commentData);

      chai.request(app)
        .get('/api/comments/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('content', 'Commentaire test');
          done();
        });
    });

    it('devrait renvoyer 404 si le commentaire n\'existe pas', (done) => {
      commentStub.findByPk.resolves(null);

      chai.request(app)
        .get('/api/comments/999')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });

  describe('POST /api/publications/:publicationId/comments', () => {
    it('devrait créer un nouveau commentaire', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const newComment = {
        content: 'Nouveau commentaire',
        userId: 1
      };

      const publicationData = {
        id: 1,
        title: 'Publication test',
        userId: 2
      };

      const createdComment = {
        id: 1,
        content: 'Nouveau commentaire',
        publicationId: 1,
        userId: 1,
        created_at: new Date()
      };

      publicationStub.findByPk.resolves(publicationData);
      userStub.findByPk.resolves({ id: 1, username: 'testuser' });
      commentStub.create.resolves(createdComment);

      chai.request(app)
        .post('/api/publications/1/comments')
        .set('Authorization', token)
        .send(newComment)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message').that.includes('créé');
          expect(res.body).to.have.property('comment');
          expect(res.body.comment).to.have.property('content', 'Nouveau commentaire');
          done();
        });
    });

    it('devrait renvoyer 400 si des données sont manquantes', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const incompleteComment = {}; // Commentaire sans contenu

      publicationStub.findByPk.resolves({ id: 1, title: 'Publication test' });

      chai.request(app)
        .post('/api/publications/1/comments')
        .set('Authorization', token)
        .send(incompleteComment)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('devrait renvoyer 404 si la publication n\'existe pas', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const newComment = { content: 'Nouveau commentaire' };

      publicationStub.findByPk.resolves(null);

      chai.request(app)
        .post('/api/publications/999/comments')
        .set('Authorization', token)
        .send(newComment)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });

  describe('PUT /api/comments/:id', () => {
    it('devrait mettre à jour un commentaire existant', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const updateData = { content: 'Commentaire mis à jour' };

      const originalComment = {
        id: 1,
        content: 'Ancien commentaire',
        publicationId: 1,
        userId: 1 // Correspond à l'utilisateur authentifié
      };

      const updatedComment = {
        id: 1,
        content: 'Commentaire mis à jour',
        publicationId: 1,
        userId: 1
      };

      commentStub.findByPk.resolves(originalComment);
      commentStub.update.resolves([1, [updatedComment]]);

      chai.request(app)
        .put('/api/comments/1')
        .set('Authorization', token)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').that.includes('mis à jour');
          expect(res.body).to.have.property('comment');
          done();
        });
    });

    it('devrait renvoyer 404 si le commentaire n\'existe pas', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé
      const updateData = { content: 'Commentaire mis à jour' };

      commentStub.findByPk.resolves(null);

      chai.request(app)
        .put('/api/comments/999')
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
      const updateData = { content: 'Commentaire mis à jour' };

      const comment = {
        id: 1,
        content: 'Commentaire original',
        publicationId: 1,
        userId: 2 // Différent de l'utilisateur authentifié
      };

      commentStub.findByPk.resolves(comment);

      chai.request(app)
        .put('/api/comments/1')
        .set('Authorization', token)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('message').that.includes('autorisé');
          done();
        });
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('devrait supprimer un commentaire', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé

      const comment = {
        id: 1,
        content: 'Commentaire à supprimer',
        publicationId: 1,
        userId: 1 // Correspond à l'utilisateur authentifié
      };

      commentStub.findByPk.resolves(comment);
      commentStub.destroy.resolves(1);

      chai.request(app)
        .delete('/api/comments/1')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').that.includes('supprimé');
          done();
        });
    });

    it('devrait renvoyer 404 si le commentaire n\'existe pas', (done) => {
      const token = 'Bearer fake-jwt-token'; // Token simulé

      commentStub.findByPk.resolves(null);

      chai.request(app)
        .delete('/api/comments/999')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').that.includes('trouvé');
          done();
        });
    });
  });
});

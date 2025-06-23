describe("Détails d'une publication", () => {
  beforeEach(() => {
    // Se connecter avant de visiter la page de détails
    cy.visit('/login');
    cy.get('input[type="email"]').type('utilisateur@exemple.com');
    cy.get('input[type="password"]').type('MotDePasse123');
    cy.contains('button', 'Se connecter').click();

    // Visiter la page de détails d'une publication
    cy.visit('/publications/1');
  });

  it('devrait afficher les détails de la publication', () => {
    // Vérifier que les éléments de détail sont présents
    cy.get('.publication-title').should('be.visible');
    cy.get('.publication-content').should('be.visible');
    cy.get('.publication-author').should('be.visible');
    cy.get('.publication-date').should('be.visible');
  });

  it('devrait afficher les commentaires existants', () => {
    // Vérifier que la section des commentaires est présente
    cy.get('.comments-section').should('exist');
    cy.get('.comment-item').should('have.length.at.least', 0);
  });

  it("devrait permettre d'ajouter un nouveau commentaire", () => {
    // Ajouter un nouveau commentaire
    const commentText = `Test de commentaire ${Date.now()}`;
    cy.get('textarea[name="comment"]').type(commentText);
    cy.contains('button', 'Poster').click();

    // Vérifier que le commentaire est ajouté dans la liste
    cy.contains('.comment-content', commentText).should('be.visible');
  });

  it('ne devrait pas soumettre un commentaire vide', () => {
    // Essayer de soumettre un commentaire vide
    cy.get('textarea[name="comment"]').clear();
    cy.contains('button', 'Poster').click();

    // Vérifier qu'un message d'erreur s'affiche
    cy.contains('Le commentaire ne peut pas être vide').should('be.visible');
  });

  it('devrait permettre de supprimer son propre commentaire', () => {
    // Ajouter un nouveau commentaire
    const commentText = `Commentaire à supprimer ${Date.now()}`;
    cy.get('textarea[name="comment"]').type(commentText);
    cy.contains('button', 'Poster').click();

    // Supprimer le commentaire
    cy.contains('.comment-content', commentText)
      .parents('.comment-item')
      .find('.delete-button')
      .click();

    // Confirmer la suppression
    cy.contains('button', 'Confirmer').click();

    // Vérifier que le commentaire a été supprimé
    cy.contains('.comment-content', commentText).should('not.exist');
  });
});

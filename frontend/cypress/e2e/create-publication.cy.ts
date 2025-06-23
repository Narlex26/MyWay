describe('Création de Publication', () => {
  beforeEach(() => {
    // Se connecter avant d'accéder à la création de publication
    cy.visit('/login');
    cy.get('input[type="email"]').type('utilisateur@exemple.com');
    cy.get('input[type="password"]').type('MotDePasse123');
    cy.contains('button', 'Se connecter').click();

    // Visiter la page de création de publication
    cy.visit('/publications/create');
  });

  it('devrait afficher le formulaire de création de publication', () => {
    // Vérifier que le formulaire est présent
    cy.get('form').should('be.visible');
    cy.get('input[name="title"]').should('exist');
    cy.get('textarea[name="content"]').should('exist');
    cy.contains('button', 'Publier').should('be.visible');
  });

  it('devrait afficher des erreurs pour les champs vides', () => {
    // Soumettre un formulaire vide
    cy.contains('button', 'Publier').click();
    cy.contains('Le titre est requis').should('be.visible');
    cy.contains('Le contenu est requis').should('be.visible');
  });

  it('devrait créer une nouvelle publication avec succès', () => {
    // Créer un titre unique pour éviter les doublons
    const uniqueTitle = `Test de publication ${Date.now()}`;
    const content = 'Contenu de test pour la publication. Cette publication est créée via un test Cypress.';

    // Remplir le formulaire
    cy.get('input[name="title"]').type(uniqueTitle);
    cy.get('textarea[name="content"]').type(content);
    cy.contains('button', 'Publier').click();

    // Vérifier la redirection vers la page de détails
    cy.url().should('include', '/publications/');

    // Vérifier que le contenu de la publication est affiché
    cy.get('.publication-title').should('contain', uniqueTitle);
    cy.get('.publication-content').should('contain', content);
  });

  it("devrait permettre l'ajout d'une image à la publication", () => {
    // Créer un titre unique
    const uniqueTitle = `Publication avec image ${Date.now()}`;

    // Remplir le formulaire
    cy.get('input[name="title"]').type(uniqueTitle);
    cy.get('textarea[name="content"]').type('Publication avec une image jointe.');

    // Téléverser une image (simulé)
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });

    // Vérifier que l'aperçu de l'image est affiché
    cy.get('.image-preview').should('be.visible');

    // Soumettre le formulaire
    cy.contains('button', 'Publier').click();

    // Vérifier la redirection et l'affichage de l'image
    cy.url().should('include', '/publications/');
    cy.get('.publication-image').should('be.visible');
  });

  it("devrait annuler la création et retourner à la page d'accueil", () => {
    // Remplir partiellement le formulaire
    cy.get('input[name="title"]').type('Publication annulée');

    // Cliquer sur le bouton d'annulation
    cy.contains('button', 'Annuler').click();

    // Vérifier la redirection vers la page d'accueil
    cy.url().should('include', '/home');
  });
});

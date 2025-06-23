describe('Authentification', () => {
  beforeEach(() => {
    // Visiter la page de connexion avant chaque test
    cy.visit('/login');
  });

  it('devrait afficher le formulaire de connexion', () => {
    // Vérifier que le formulaire est présent
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('button', 'Se connecter').should('be.visible');
  });

  it('devrait afficher des erreurs lorsque les champs sont vides', () => {
    // Soumettre un formulaire vide
    cy.contains('button', 'Se connecter').click();
    cy.contains('Veuillez saisir votre email').should('be.visible');
    cy.contains('Veuillez saisir votre mot de passe').should('be.visible');
  });

  it('devrait se connecter avec des identifiants valides', () => {
    // Remplir le formulaire avec des identifiants valides
    cy.get('input[type="email"]').type('utilisateur@exemple.com');
    cy.get('input[type="password"]').type('MotDePasse123');
    cy.contains('button', 'Se connecter').click();

    // Vérifier que l'utilisateur est redirigé vers la page d'accueil
    cy.url().should('include', '/home');

    // Vérifier que le token d'authentification est stocké
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.exist;
    });
  });

  it("devrait naviguer vers la page d'inscription", () => {
    // Cliquer sur le lien d'inscription
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/register');
  });
});

describe('Inscription', () => {
  beforeEach(() => {
    // Visiter la page d'inscription avant chaque test
    cy.visit('/register');
  });

  it("devrait afficher le formulaire d'inscription", () => {
    // Vérifier que le formulaire est présent
    cy.get('form').should('be.visible');
    cy.get('input[name="username"]').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('button', "S'inscrire").should('be.visible');
  });

  it('devrait afficher des erreurs pour les champs obligatoires vides', () => {
    // Soumettre un formulaire vide
    cy.contains('button', "S'inscrire").click();
    cy.contains("Veuillez saisir un nom d'utilisateur").should('be.visible');
    cy.contains('Veuillez saisir une adresse email valide').should('be.visible');
    cy.contains('Le mot de passe est requis').should('be.visible');
  });

  it('devrait vérifier la confirmation du mot de passe', () => {
    // Remplir le formulaire avec des mots de passe différents
    cy.get('input[name="username"]').type('nouvelutilisateur');
    cy.get('input[type="email"]').type('nouvel.utilisateur@exemple.com');
    cy.get('input[name="password"]').type('MotDePasse123');
    cy.get('input[name="confirmPassword"]').type('MotDePasseDifferent');
    cy.contains('button', "S'inscrire").click();

    // Vérifier le message d'erreur
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
  });

  it('devrait créer un compte avec succès', () => {
    // Générer un email unique pour éviter les conflits
    const uniqueEmail = `test${Date.now()}@exemple.com`;

    // Remplir le formulaire avec des données valides
    cy.get('input[name="username"]').type('nouvelutilisateur');
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[name="password"]').type('MotDePasse123');
    cy.get('input[name="confirmPassword"]').type('MotDePasse123');
    cy.contains('button', "S'inscrire").click();

    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    cy.url().should('include', '/login');
    cy.contains('Compte créé avec succès').should('be.visible');
  });

  it('devrait naviguer vers la page de connexion', () => {
    // Cliquer sur le lien de connexion
    cy.contains('Déjà un compte? Se connecter').click();
    cy.url().should('include', '/login');
  });
});

describe("Page d'accueil", () => {
  beforeEach(() => {
    // Visiter la page d'accueil avant chaque test
    cy.visit('/');
  });

  it("devrait afficher la page d'accueil correctement", () => {
    // Vérifier que les éléments principaux sont présents
    cy.get('app-home').should('exist');
    cy.contains('h1', 'MyWay').should('be.visible');
  });

  it('devrait naviguer vers la page de connexion', () => {
    // Cliquer sur le bouton de connexion et vérifier la navigation
    cy.contains('Connexion').click();
    cy.url().should('include', '/login');
  });

  it('devrait afficher les publications récentes', () => {
    // Vérifier que la liste des publications est chargée
    cy.get('.publications-list').should('exist');
    cy.get('.publication-card').should('have.length.at.least', 1);
  });
});

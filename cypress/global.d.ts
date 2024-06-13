declare namespace Cypress {
  interface Chainable<Subject = any> {
    getDataTest(dataTestSelector: string): Chainable<JQuery<HTMLElement>>;
    authenticateUser();
  }
}

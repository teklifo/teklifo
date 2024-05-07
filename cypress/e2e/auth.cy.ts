describe("authentication test", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("email provider test", () => {
    cy.getDataTest("email-provider-trigger").click();
    cy.getDataTest("email-provider-email-input")
      .as("email-input")
      .should("exist");
    cy.get("@email-input").type("kamranv21");
    cy.getDataTest("email-provider-submit-btn").as("btn").click();
    cy.get(".text-destructive").should("exist");
    cy.get("@email-input").clear();
    cy.get("@email-input").type("kamranv21@gmail.com");
    cy.get("@btn").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/check-email"
    );
  });

  it("credentials provider test", () => {
    cy.getDataTest("credentials-provider-trigger").click();
    cy.getDataTest("credentials-provider-email-input")
      .as("email-input")
      .should("exist");
    cy.getDataTest("credentials-provider-password-input")
      .as("password-input")
      .should("exist");
    cy.getDataTest("credentials-provider-submit-btn").as("btn").click();
    cy.get(".text-destructive").should("exist");
    cy.get("@email-input").type("kamranv21");
    cy.get(".text-destructive").should("exist");
    cy.get("@email-input").clear();
    cy.get("@email-input").type("kamranv21@gmail.com");
    cy.get(".text-destructive").should("exist");
    cy.get("@password-input").type("1234");
    cy.get("@btn").click();
    cy.get(".text-destructive").should("not.exist");
    cy.get("@password-input").clear();
    cy.get("@password-input").type("123456");
    cy.get("@btn").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/dashboard"
    );
  });
});

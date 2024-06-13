describe("company CRUD testing", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("company CRUD", () => {
    // Check authentication
    cy.visit("/my-companies");
    cy.location("pathname", { timeout: 10000 }).should(
      "not.equal",
      "/en/my-companies"
    );
    cy.authenticateUser();
    cy.visit("/my-companies");
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/my-companies"
    );

    // Create new company
    cy.visit("/new-company");
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/new-company"
    );
    cy.getDataTest("submit").click();
    cy.getDataTest("id-error").should("exist");
    cy.getDataTest("name-error").should("exist");
    cy.getDataTest("tin-error").should("exist");
    cy.getDataTest("slogan-error").should("not.exist");

    cy.getDataTest("id").clear().type("0 acme inc");
    cy.getDataTest("name").clear().type("Kraft LLC");
    cy.getDataTest("tin").clear().type("abcdefghij");
    cy.getDataTest("slogan")
      .clear()
      .type(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget enim erat. Vestibulum interdum posuere eros, vel semper elit."
      );
    cy.getDataTest("submit").click();
    cy.getDataTest("id-error").should("exist");
    cy.getDataTest("name-error").should("not.exist");
    cy.getDataTest("tin-error").should("exist");
    cy.getDataTest("slogan-error").should("exist");

    cy.getDataTest("id").clear().type("acme_inc");
    cy.getDataTest("tin").clear().type("0123456789");
    cy.getDataTest("slogan").clear().type("Shaping the future since 1910");
    cy.getDataTest("submit").click();
    cy.getDataTest("id-error").should("exist");
    cy.getDataTest("tin-error").should("not.exist");
    cy.getDataTest("slogan-error").should("not.exist");

    cy.getDataTest("id").clear().type("acme-inc");
    cy.getDataTest("submit").click();
    cy.getDataTest("id-error").should("not.exist");
    cy.get(".bg-destructive").should("exist");

    cy.getDataTest("tin").clear().type("8800555353");
    cy.getDataTest("description")
      .invoke(
        "val",
        "Cras a viverra eros. Pellentesque vitae rutrum mauris, et ultrices tortor. In gravida semper leo. Maecenas metus mauris, efficitur nec luctus ac, tempor nec velit. In in lacus id tellus rhoncus vestibulum. Donec viverra et metus eget blandit. Nunc efficitur posuere nibh, at venenatis quam pellentesque in. Donec in gravida purus, id vehicula eros. Nulla nec augue nunc. Vestibulum porta ac risus quis blandit."
      )
      .trigger("input")
      .type(" {backspace}");
    cy.getDataTest("submit").click();
    cy.get(".bg-destructive").should("exist");

    cy.getDataTest("name").clear().type("Acme");
    cy.getDataTest("submit").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/company/acme-inc"
    );

    // Check cookie
    cy.getCookie("user-company").should("have.property", "value", "acme-inc");

    // Check roles & members
    cy.visit("/roles");
    cy.getDataTest("role-card").should("exist").should("have.length", 1);

    cy.visit("/members");
    cy.getDataTest("member-card").should("exist").should("have.length", 1);

    // Update company
    cy.visit("/company/acme-inc");
    cy.getDataTest("edit-company").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/edit-company"
    );
    cy.getDataTest("name").clear().type("Acme Inc.");
    cy.getDataTest("submit").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/company/acme-inc"
    );
    cy.contains("Acme Inc.");

    // Delete company
    cy.visit("/company/acme-inc");
    cy.getDataTest("delete-company").click();
    cy.getDataTest("confirm-delete-company").click();
    cy.location("pathname", { timeout: 10000 }).should(
      "equal",
      "/en/my-companies"
    );
    cy.visit("/company/acme-inc", { failOnStatusCode: false });
    cy.getCookie("user-company").should(
      "not.have.property",
      "value",
      "acme-inc"
    );
  });
});

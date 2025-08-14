import { visitWithState } from "../common/tools";
import { TolgeeClient } from "@tginternal/client";
import {
  createProjectWithClient,
  createPak,
  deleteProject,
  Options,
} from "../common/apiClient";
import { EXAMPLE_PROJECT } from "../common/exampleProject";
import { createTestNode, SIGNED_IN } from "@/web/urlConfig";

let client: TolgeeClient;
let pak: string;

describe("Push", () => {
  beforeEach(async () => {
    await createProject({ translationProtection: "PROTECT_REVIEWED" });
    await markTitleAsReviewed();
  });

  afterEach(() => {
    deleteProject(client);
  });

  it("shows differences correctly", () => {
    const nodes = [
      createTestNode({ text: "New key", key: "new_key" }),
      createTestNode({ text: "Changed key", key: "on-the-road-subtitle" }),
    ];
    visitWithState({
      config: getCredentials(),
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframeBody().contains("New key").should("exist");

    cy.iframeBody().findDcy("index_push_button").should("be.visible").click();

    cy.iframeBody().contains("New keys").should("exist");

    cy.iframeBody()
      .findDcy("changes_new_keys")
      .contains("new_key")
      .should("be.visible");

    cy.iframeBody()
      .findDcy("changes_changed_keys")
      .contains("on-the-road-subtitle")
      .should("be.visible");
    cy.wait;
  });

  it("catches conflicts", () => {
    const nodes = [
      createTestNode({ text: "First value", key: "new_key" }),
      createTestNode({ text: "Second value", key: "new_key" }),
    ];
    visitWithState({
      config: getCredentials(),
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframeBody().contains("First value").should("exist");

    cy.iframeBody().findDcy("index_push_button").should("be.visible").click();

    cy.iframeBody()
      .contains("There are multiple different translations for single key")
      .should("exist");
  });

  it("pushes screenshot correctly", () => {
    const nodes = [
      createTestNode({ text: "On the road", key: "on-the-road-title" }),
    ];
    visitWithState({
      config: { ...getCredentials(), updateScreenshots: true },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframeBody().contains("On the road").should("exist");
    cy.iframeBody().findDcy("index_push_button").should("be.visible").click();

    cy.iframeBody().contains("No changes necessary").should("be.visible");
    cy.iframeBody().findDcy("push_upload_screenshots_checkbox").should("exist");
    cy.iframeBody().findDcy("push_submit_button").should("be.visible").click();

    cy.iframeBody()
      .contains("Successfully updated 0 key(s) and uploaded 1 screenshot(s).")
      .should("be.visible");
    cy.iframeBody().findDcy("push_ok_button").should("be.visible").click();
  });

  it("doesn't push screenshot when disabled", () => {
    const nodes = [
      createTestNode({ text: "On the road", key: "on-the-road-title" }),
    ];
    visitWithState({
      config: { ...getCredentials(), updateScreenshots: false },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframeBody().contains("On the road").should("exist");
    cy.iframeBody().findDcy("index_push_button").should("be.visible").click();

    cy.iframeBody().contains("No changes necessary").should("be.visible");

    cy.iframeBody().findDcy("push_finish_button").should("be.visible").click();
  });

  it("doesn't override protected translation by default", () => {
    const nodes = [
      createTestNode({
        text: "On the road updated",
        key: "on-the-road-title",
      }),
    ];
    visitWithState({
      config: { ...getCredentials(), updateScreenshots: false },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframeBody().contains("On the road updated").should("exist");

    cy.iframeBody().findDcy("index_push_button").click();

    cy.iframeBody().contains("Changed keys").should("be.visible");

    cy.iframeBody().findDcy("push_submit_button").should("be.visible").click();

    cy.iframeBody()
      .contains("Successfully updated 0 key(s) and uploaded 0 screenshot(s).")
      .should("exist");

    cy.iframeBody()
      .contains("Some translations cannot be updated:")
      .should("exist");

    cy.iframeBody().contains("on-the-road-title (overridable)").should("exist");

    cy.iframeBody()
      .findDcy("push-override-all-button")
      .should("be.visible")
      .click();

    cy.iframeBody()
      .contains("Successfully updated 1 key(s) and uploaded 0 screenshot(s).")
      .should("exist");
  });

  function getCredentials() {
    return { ...SIGNED_IN, apiKey: pak };
  }

  async function createProject(options?: Options) {
    client = await createProjectWithClient(
      "Project 1",
      EXAMPLE_PROJECT,
      options
    );
    pak = await createPak(client);
  }

  async function markTitleAsReviewed() {
    const { data: keys } = await client.GET("/v2/projects/{projectId}/keys", {
      params: { path: { projectId: client.getProjectId() } },
    });
    const key = keys!._embedded!.keys!.find(
      (k) => k.name === "on-the-road-title"
    )!;
    await client.PUT("/v2/projects/{projectId}/keys/{id}/complex-update", {
      params: { path: { projectId: client.getProjectId(), id: key.id } },
      body: {
        name: key.name,
        states: {
          en: "REVIEWED",
          cs: "REVIEWED",
          fr: "REVIEWED",
          de: "REVIEWED",
        },
      },
    });
  }
});

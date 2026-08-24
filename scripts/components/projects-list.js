const MESSAGE_CLASSES = "text-sm text-gray-500 md:col-span-2";
const LOADING_MESSAGE = "Loading projects…";
const ERROR_MESSAGE = "Unable to load projects.";

class ProjectsList extends HTMLElement {
  connectedCallback() {
    this.load();
  }

  async load() {
    this.showMessage(LOADING_MESSAGE);
    try {
      const response = await fetch("./content/projects.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const projects = await response.json();
      if (!Array.isArray(projects)) {
        throw new Error("Expected an array of projects");
      }
      this.renderProjects(projects);
    } catch (error) {
      console.error("Failed to load projects:", error);
      this.showMessage(ERROR_MESSAGE);
    }
  }

  showMessage(text) {
    const message = document.createElement("p");
    message.className = MESSAGE_CLASSES;
    message.textContent = text;
    this.replaceChildren(message);
  }

  renderProjects(projects) {
    this.replaceChildren(
      ...projects.map((project) => {
        const card = document.createElement("project-card");
        card.data = project;
        return card;
      })
    );
  }
}

customElements.define("projects-list", ProjectsList);

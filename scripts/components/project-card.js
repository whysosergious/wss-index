const CARD_CLASSES =
  "bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col hover-lift cursor-pointer";
const TAG_CLASSES =
  "px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-md";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#39;");
}

class ProjectCard extends HTMLElement {
  get data() {
    return this._data;
  }

  set data(project) {
    this._data = project;
    this.render();
  }

  connectedCallback() {
    if (this._data) {
      this.render();
    }
  }

  render() {
    const project = this._data ?? {};
    const image = project.image ?? {};
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const slug = project.slug ?? "";

    this.className = CARD_CLASSES;
    this.innerHTML = `
      <a
        href="./projects/${escapeHtml(slug)}.html"
        class="flex flex-col h-full text-decoration-none text-inherit"
      >
        <div class="aspect-video w-full overflow-hidden">
          <img
            alt="${escapeHtml(image.alt)}"
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            src="${escapeHtml(image.src)}"
          />
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <h3 class="text-xl font-bold text-gray-900 leading-tight mb-3">
            ${escapeHtml(project.title)}
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed text-sm flex-grow">
            ${escapeHtml(project.description)}
          </p>
          <div class="flex flex-wrap gap-2">
            ${tags
              .map(
                (tag) =>
                  `<span class="${TAG_CLASSES}">${escapeHtml(tag)}</span>`,
              )
              .join("")}
          </div>
        </div>
      </a>`;
  }
}

customElements.define("project-card", ProjectCard);

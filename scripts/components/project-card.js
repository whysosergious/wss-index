const CARD_CLASSES =
  "bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col hover-lift";
const TAG_CLASSES =
  "px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-md";

function escapeHtml(value) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>"']/g, (char) => map[char]);
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

    this.className = CARD_CLASSES;
    this.innerHTML = `
            <div class="aspect-video w-full overflow-hidden">
              <img
                alt="${escapeHtml(image.alt)}"
                class="w-full h-full object-cover"
                src="${escapeHtml(image.src)}"
              />
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-gray-900 leading-tight">${escapeHtml(project.title)}</h3>
              </div>
              <p class="text-xs text-gray-400 mb-4">${escapeHtml(project.date)}</p>
              <p class="text-gray-600 mb-6 leading-relaxed text-sm flex-grow">${escapeHtml(project.description)}</p>
              <div class="flex flex-wrap gap-2">
                ${tags
                  .map(
                    (tag) =>
                      `<span\n                  class="${TAG_CLASSES}"\n                  >${escapeHtml(tag)}</span\n                >`
                  )
                  .join("\n                ")}
              </div>
            </div>`;
  }
}

customElements.define("project-card", ProjectCard);

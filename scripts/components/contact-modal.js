/**
 * @fileoverview Contact modal — accessible native <dialog> wrapping <contact-form>.
 * Any element with [data-open-contact] opens it, on any page that includes
 * this component. Esc and backdrop clicks close; focus returns to the trigger.
 *
 * @element contact-modal
 */
export class ContactModal extends HTMLElement {
  /** @type {HTMLDialogElement | null} */
  dialog = null;
  /** @type {HTMLElement | null} */
  lastTrigger = null;

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.render();
    this.dialog = this.querySelector("dialog");

    this.querySelector("[data-close]")?.addEventListener("click", () =>
      this.close(),
    );
    // Backdrop click closes (clicks on the card itself bubble from children)
    this.dialog?.addEventListener("click", (e) => {
      if (e.target === this.dialog) this.close();
    });
    this.dialog?.addEventListener("close", () => {
      document.body.classList.remove("overflow-hidden");
      if (this.lastTrigger && typeof this.lastTrigger.focus === "function") {
        this.lastTrigger.focus();
      }
      this.lastTrigger = null;
    });

    // Global trigger delegation: works for buttons added anywhere, anytime
    document.addEventListener("click", (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const trigger = target.closest?.("[data-open-contact]");
      if (trigger) {
        e.preventDefault();
        this.open(/** @type {HTMLElement} */ (trigger));
      }
    });
  }

  render() {
    this.innerHTML = `
      <dialog
        aria-labelledby="contact-modal-title"
        class="rounded-lg border border-gray-200 shadow-xl p-0 w-[min(32rem,calc(100%-2rem))] text-gray-900 backdrop:bg-[#110e25]/60"
      >
        <div class="p-6 sm:p-7">
          <div class="flex items-start justify-between gap-4 mb-1">
            <h3 id="contact-modal-title" class="text-lg font-semibold leading-snug">
              Send me a message
            </h3>
            <button
              type="button"
              data-close
              aria-label="Close"
              class="shrink-0 -mt-1 -mr-1 p-1 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </button>
          </div>
          <p class="text-[13px] text-gray-500 mb-6">
            Short and specific beats long and vague.
          </p>
          <contact-form></contact-form>
        </div>
      </dialog>
    `;
  }

  /**
   * @param {HTMLElement | null} [trigger]
   */
  open(trigger = null) {
    if (!this.dialog || this.dialog.open) return;
    this.lastTrigger = trigger;
    document.body.classList.add("overflow-hidden");
    this.dialog.showModal();
  }

  close() {
    if (this.dialog && this.dialog.open) this.dialog.close();
  }
}

if (!customElements.get("contact-modal")) {
  customElements.define("contact-modal", ContactModal);
}

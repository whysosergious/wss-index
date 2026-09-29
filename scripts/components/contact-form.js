/**
 * @fileoverview Contact form web component — light-DOM, SEO-safe, progressively enhanced.
 * Tight vertical rhythm, 6px radii, left-aligned fields, right-aligned submit.
 * Deliberately avoids the oversized-pill / big-radius look.
 */

/**
 * @typedef {Object} FormDataPayload
 * @property {string} name
 * @property {string} email
 * @property {string} message
 * @property {boolean} consent
 */

const RESEND_API_URL = "https://resend-api-plum.vercel.app/api/send";
const RESEND_API_KEY =
  "f0a48f472737317bf367fe0cf1a704c3fe06e219ce4d08b24a651af74456a5cb";
const RESEND_TO_EMAIL = "sergio.stankevich@gmail.com";

const INPUT_CLASSES =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[15px] " +
  "leading-6 text-gray-900 placeholder-gray-400 outline-none transition-colors " +
  "focus:border-gray-900";
const INPUT_ERROR_CLASSES = ["border-red-500"];
const LABEL_CLASSES = "block text-[13px] font-medium text-gray-600 mb-1";
const ERROR_CLASSES = "block text-xs text-red-600 mt-1";

/**
 * @element contact-form
 * @description Accessible contact form. Keeps native <form> markup indexable.
 * Emits `contact-submit` custom event with FormDataPayload detail.
 * Provides inline validation and status region for a11y.
 * On submit, posts to the Resend proxy API (key exchanged server-side).
 */
export class ContactForm extends HTMLElement {
  /** @type {HTMLFormElement | null} */
  form = null;
  /** @type {HTMLElement | null} */
  statusEl = null;

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    if (this.querySelector("form")) {
      this.enhanceExisting();
    } else {
      this.render();
    }
    this.cacheElements();
    this.bindEvents();
  }

  /** Enhance server-rendered form: add novalidate + status region if missing */
  enhanceExisting() {
    const form = this.querySelector("form");
    if (form && !form.hasAttribute("novalidate")) {
      form.setAttribute("novalidate", "");
    }
    if (!this.querySelector("[data-status]")) {
      const region = document.createElement("p");
      region.setAttribute("data-status", "");
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      region.className = "text-[13px] text-gray-600 mt-3";
      form?.after(region);
    }
  }

  render() {
    this.innerHTML = `
      <form novalidate class="text-left">
        <div class="mb-3">
          <label class="${LABEL_CLASSES}" for="cf-name">Name</label>
          <input class="${INPUT_CLASSES}" id="cf-name" name="name" placeholder="Your name" required type="text" autocomplete="name" />
          <span class="${ERROR_CLASSES}" data-error="name" aria-live="polite"></span>
        </div>
        <div class="mb-3">
          <label class="${LABEL_CLASSES}" for="cf-email">Email</label>
          <input class="${INPUT_CLASSES}" id="cf-email" name="email" placeholder="you@company.com" required type="email" autocomplete="email" />
          <span class="${ERROR_CLASSES}" data-error="email" aria-live="polite"></span>
        </div>
        <div class="mb-3">
          <label class="${LABEL_CLASSES}" for="cf-message">Message</label>
          <textarea class="${INPUT_CLASSES} resize-y" id="cf-message" name="message" placeholder="What are you working on?" required rows="4"></textarea>
          <span class="${ERROR_CLASSES}" data-error="message" aria-live="polite"></span>
        </div>
        <div class="flex items-start gap-2 mb-1">
          <input class="mt-0.5 h-4 w-4 shrink-0 accent-gray-900" id="cf-consent" name="consent" required type="checkbox" />
          <label class="text-[13px] leading-5 text-gray-500" for="cf-consent">
            You can reply to me by email. Nothing else happens with it.
          </label>
        </div>
        <span class="${ERROR_CLASSES}" data-error="consent" aria-live="polite"></span>
        <div class="flex justify-end mt-4">
          <button
            class="inline-flex items-center gap-2 bg-[#0b1021] text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-[#1c2140] transition-colors disabled:opacity-60"
            type="submit"
          >
            Connect
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>
        </div>
        <p class="text-[13px] text-gray-600 mt-3" data-status role="status" aria-live="polite"></p>
      </form>
    `;
  }

  cacheElements() {
    this.form = this.querySelector("form");
    this.statusEl = this.querySelector("[data-status]");
  }

  bindEvents() {
    this.form?.addEventListener("submit", this.onSubmit);
    // live-clear errors on input
    this.form?.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () =>
        this.clearError(/** @type {HTMLInputElement} */ (el).name || el.id),
      );
    });
  }

  /**
   * @param {SubmitEvent} e
   */
  onSubmit = async (e) => {
    e.preventDefault();
    if (!this.form) return;

    const data = new FormData(this.form);
    /** @type {FormDataPayload} */
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      consent:
        data.get("consent") !== null ||
        /** @type {HTMLInputElement} */ (
          this.form.querySelector('[name="consent"]')
        )?.checked === true,
    };

    if (!this.validate(payload)) return;

    // Emit event for backwards-compat / external listeners
    this.dispatchEvent(
      new CustomEvent("contact-submit", {
        detail: payload,
        bubbles: true,
        composed: true,
      }),
    );

    const submitBtn = /** @type {HTMLButtonElement | null} */ (
      this.form.querySelector('button[type="submit"]')
    );
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : null;

    this.setStatus("Sending…", "text-gray-600");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      submitBtn.setAttribute("aria-busy", "true");
    }

    try {
      const res = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          name: payload.name,
          to_email: RESEND_TO_EMAIL,
          email: payload.email,
          message: payload.message,
          from: `Portfolio contact — ${payload.name}`,
          subject: `Portfolio — message from ${payload.name}`,
        }),
      });

      let body = null;
      try {
        body = await res.json();
      } catch (_) {
        body = null;
      }

      if (!res.ok) {
        const msg =
          (body && (body.error || body.message)) || `Error ${res.status}`;
        throw new Error(String(msg));
      }

      this.setStatus(
        "Thanks — message sent. I usually reply within a day or two.",
        "text-green-700",
      );
      this.form.reset();
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      console.error("[contact-form] send failed:", message, err);
      this.setStatus(
        "Sending failed. Please email sergio.stankevich@gmail.com instead.",
        "text-red-600",
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (originalBtnHtml !== null) submitBtn.innerHTML = originalBtnHtml;
        submitBtn.removeAttribute("aria-busy");
      }
    }
  };

  /**
   * @param {string} text
   * @param {string} colorClass
   */
  setStatus(text, colorClass) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.classList.remove(
      "text-gray-600",
      "text-green-700",
      "text-red-600",
    );
    this.statusEl.classList.add(colorClass);
  }

  /**
   * @param {FormDataPayload} p
   * @returns {boolean}
   */
  validate(p) {
    let ok = true;
    this.clearAllErrors();

    if (!p.name || p.name.length < 2) {
      this.setError("name", "Please add your name.");
      ok = false;
    }
    if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      this.setError("email", "That email address doesn't look valid.");
      ok = false;
    }
    if (!p.message || p.message.length < 5) {
      this.setError("message", "Please add a short message.");
      ok = false;
    }
    if (!p.consent) {
      this.setError("consent", "Please tick the box so I know I can reply.");
      ok = false;
    }

    if (!ok) {
      this.setStatus("Check the fields above.", "text-red-600");
    }

    return ok;
  }

  /**
   * @param {string} field
   * @param {string} msg
   */
  setError(field, msg) {
    const el = this.querySelector(`[data-error="${field}"]`);
    if (el) el.textContent = msg;
    const input = this.form?.querySelector(`[name="${field}"]`);
    if (input) input.classList.add(...INPUT_ERROR_CLASSES);
  }

  /**
   * @param {string} field
   */
  clearError(field) {
    const map = { "cf-name": "name", "cf-email": "email", "cf-message": "message" };
    const key = map[field] || field;
    const el = this.querySelector(`[data-error="${key}"]`);
    if (el) el.textContent = "";
    const input = this.form?.querySelector(`[name="${key}"]`);
    if (input) input.classList.remove(...INPUT_ERROR_CLASSES);
  }

  clearAllErrors() {
    this.querySelectorAll("[data-error]").forEach((el) => (el.textContent = ""));
    this.form
      ?.querySelectorAll("input, textarea")
      .forEach((el) => el.classList.remove(...INPUT_ERROR_CLASSES));
    if (this.statusEl) this.statusEl.textContent = "";
  }
}

if (!customElements.get("contact-form")) {
  customElements.define("contact-form", ContactForm);
}

import { model } from "../model/model.js";

class TagManagerModal extends HTMLElement {
    #open = false;
    #editTagId = null;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        // Öffnen über Event aus z.B. EventDetail
        document.addEventListener("open-tag-manager", () => this.open());

        // Wenn Tags im Model geändert werden → neu rendern
        model.addEventListener("tags-changed", () => this.render());

        this.render();
    }

    disconnectedCallback() {
        document.removeEventListener("open-tag-manager", () => this.open());
    }

    open() {
        this.#open = true;
        this.#editTagId = null;
        this.render();
    }

    close() {
        this.#open = false;
        this.#editTagId = null;
        this.render();
    }

    render() {
        if (!this.#open) {
            this.shadowRoot.innerHTML = "";
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="backdrop">
                <div class="modal">
                    <h2>Tags verwalten</h2>

                    <ul class="tag-list">
                        ${model.tags.map(tag => `
                            <li>
                                ${
            this.#editTagId === tag.id
                ? `
                                            <input
                                                data-edit-input
                                                value="${tag.title}"
                                            >
                                            <button data-save="${tag.id}" class="primary">
                                                Speichern
                                            </button>
                                            <button data-cancel>
                                                Abbrechen
                                            </button>
                                        `
                : `
                                            <span>${tag.title}</span>

                                            <div class="actions">
                                                <button data-edit="${tag.id}">
                                                    ✏️
                                                </button>
                                                <button data-delete="${tag.id}">
                                                    🗑️
                                                </button>
                                            </div>
                                        `
        }
                            </li>
                        `).join("")}
                    </ul>

                    <div class="new-tag">
                        <input
                            id="new-tag-input"
                            placeholder="Neuen Tag anlegen"
                        >
                        <button id="add-tag" class="primary">
                            Hinzufügen
                        </button>
                    </div>

                    <div class="footer">
                        <button id="close">
                            Schließen
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }



    bindEvents() {
        // Modal schließen
        this.shadowRoot.querySelector("#close")
            ?.addEventListener("click", () => this.close());

        // Neuer Tag
        this.shadowRoot.querySelector("#add-tag")
            ?.addEventListener("click", () => this.handleAddTag());

        // Bearbeiten starten
        this.shadowRoot.querySelectorAll("[data-edit]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    this.#editTagId = btn.dataset.edit;
                    this.render();
                });
            });

        // Bearbeiten abbrechen
        this.shadowRoot.querySelectorAll("[data-cancel]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    this.#editTagId = null;
                    this.render();
                });
            });

        // Bearbeiten speichern
        this.shadowRoot.querySelectorAll("[data-save]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.dataset.save;
                    const input = this.shadowRoot.querySelector("[data-edit-input]");
                    const title = input.value.trim();

                    if (title) {
                        model.updateTag(id, title);
                        this.#editTagId = null;
                    }
                });
            });

        // Löschen
        this.shadowRoot.querySelectorAll("[data-delete]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = btn.dataset.delete;

                    if (confirm("Tag wirklich löschen?")) {
                        model.deleteTag(id);
                    }
                });
            });

        // Klick auf Hintergrund → schließen
        this.shadowRoot.querySelector(".backdrop")
            ?.addEventListener("click", e => {
                if (e.target.classList.contains("backdrop")) {
                    this.close();
                }
            });
    }



    handleAddTag() {
        const input = this.shadowRoot.querySelector("#new-tag-input");
        const title = input.value.trim();
        if (!title) return;

        model.addTag(title);
        input.value = "";
    }


    get styles() {
        return `
            .backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .modal {
                background: var(--bg, #fff);
                border-radius: var(--radius, 8px);
                padding: 20px;
                width: 100%;
                max-width: 420px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            h2 {
                margin: 0;
            }

            .tag-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 8px;
                overflow-y: auto;
            }

            .tag-list li {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }

            .actions {
                display: flex;
                gap: 6px;
            }

            .new-tag {
                display: flex;
                gap: 6px;
            }

            .footer {
                display: flex;
                justify-content: flex-end;
            }

            input {
                flex: 1;
                padding: 6px 8px;
                border-radius: var(--radius, 6px);
                border: 1px solid var(--border, #ccc);
            }

            button {
                padding: 6px 10px;
                border-radius: var(--radius, 6px);
                border: 1px solid var(--border, #ccc);
                background: var(--bg-elev, #f5f5f5);
                cursor: pointer;
            }

            button.primary {
                background: var(--primary, #3f51b5);
                color: white;
                border: none;
            }
        `;
    }
}

customElements.define("tag-manager-modal", TagManagerModal);

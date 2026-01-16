import { model } from "../model/model.js";

// EventDetail -> Web Component
// Zeigt Detailansicht eines Events und erlaubt Bearbeiten / Erstellen
class EventDetail extends HTMLElement {
    #event;
    #editMode = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.handleEventChanged = this.handleEventChanged.bind(this);
    }

    //wird aufgerufen wenn Elemente im DOM hinzugefügt werden
    //View registriert sich hier als Observer beim Model
    //und reagiert auf event-changed
    connectedCallback() {
        model.addEventListener("event-changed", this.handleEventChanged);

        // Wenn Tags geändert werden  im Modal → neu rendern
        model.addEventListener("tags-changed", () => {
            this.updateTagCheckboxes();
        });


        this.#event = model.currentEvent;
        this.render();
    }

    disconnectedCallback() {
        model.removeEventListener("event-changed", this.handleEventChanged);
    }

    //Wenn sich aktuelles Event im Model ändert -> neu rendern
    handleEventChanged(e) {
        this.#event = e.detail.event;
        this.#editMode = false;
        this.render();
    }

    mapParticipationStatus(status) {
        if (status === "accepted") return "zugesagt";
        if (status === "declined") return "abgesagt";
        if (status === "undecided") return "offen";
        return status;
    }

    render() {
        // Neues Event anlegen
        if (this.#event === null) {
            this.#editMode = false;
            this.renderEventForm();
            return;
        }

        // Kein Event ausgewählt
        if (!this.#event) {
            this.shadowRoot.innerHTML = `
                <style>${this.styles}</style>
                <div class="empty">Bitte Event auswählen …</div>
            `;
            return;
        }

        // Event bearbeiten
        if (this.#editMode) {
            this.renderEventForm(this.#event);
            return;
        }

        // Detailansicht
        this.renderViewMode();
    }

    /* Detailansicht*/

    renderViewMode() {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="detail">
                <h2 class="title">${this.#event.title}</h2>

                <div class="meta">
                    ${this.#event.location || "—"} • ${this.#event.status}
                </div>

                <div class="section">
                    <div class="label">Beschreibung</div>
                    <p>${this.#event.description || "Keine Beschreibung"}</p>
                </div>

                <div class="section">
                    <div class="label">Tags</div>
                    <p>
                        ${
            this.#event.tagIds?.length
                ? this.#event.tagIds
                    .map(id => model.getTagTitle(id))
                    .join(", ")
                : "keine"
        }
                    </p>
                </div>

                <div class="section">
                    <div class="label">Teilnehmer</div>
                    <ul>
                        ${this.#event.participants.map(p => {
            const person = model.getParticipantById(p.participantId);
            return `
                                <li>
                                    ${person?.name ?? "?"}
                                    (${this.mapParticipationStatus(p.status)})
                                </li>
                            `;
        }).join("")}
                    </ul>
                </div>

                <div class="actions">
                    <button id="edit" class="primary">Bearbeiten</button>
                    <button id="delete">Löschen</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector("#edit").onclick = () => {
            this.#editMode = true;
            this.render();
        };

        this.shadowRoot.querySelector("#delete").onclick = () => {
            if (confirm("Event wirklich löschen?")) {
                model.deleteEvent(this.#event.id);
            }
        };
    }

    /* Event bearbeiten/erstellen */

    renderEventForm(event = {}) {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="detail">
                <h2>${this.#editMode ? "Event bearbeiten" : "Neues Event"}</h2>

                <label>
                    Titel
                    <input id="title" value="${event.title ?? ""}">
                    <span class="error" hidden>Bitte gib einen Event-Titel ein</span>
                </label>

                <label>
                    Datum & Uhrzeit
                    <input id="datetime" type="datetime-local" value="${event.datetime ?? ""}">
                </label>

                <label>
                    Ort
                    <input id="location" value="${event.location ?? ""}">
                </label>

                <label>
                    Beschreibung
                    <textarea id="description">${event.description ?? ""}</textarea>
                </label>

                <label>
                    Status
                    <select id="status">
                        <option value="geplant" ${event.status === "geplant" ? "selected" : ""}>geplant</option>
                        <option value="abgeschlossen" ${event.status === "abgeschlossen" ? "selected" : ""}>abgeschlossen</option>
                    </select>
                </label>

                <!-- TAGS -->
            <div class="section">
    <div class="label">Tags</div>

    <div class="tags">
        ${model.tags.map(tag => `
            <label class="check">
                <input
                    type="checkbox"
                    name="tag"
                    value="${tag.id}"
                    ${event.tagIds?.includes(tag.id) ? "checked" : ""}
                >
                <span>${tag.title}</span>
            </label>
        `).join("")}
    </div>

    <button id="manage-tags" type="button" class="primary">
        Tags verwalten
    </button>
</div>


                <!-- TEILNEHMER -->
                <div class="section">
                    <div class="label">Teilnehmer</div>

                    ${model.participants.map(p => {
            const existing = event.participants?.find(
                ep => ep.participantId === p.id
            );

            return `
                            <label class="check">
                                <input
                                    type="checkbox"
                                    name="participant"
                                    value="${p.id}"
                                    ${existing ? "checked" : ""}
                                >
                                <span>${p.name}</span>

                                <select data-id="${p.id}">
                                    <option value="accepted" ${existing?.status === "accepted" ? "selected" : ""}>zugesagt</option>
                                    <option value="undecided" ${!existing || existing?.status === "undecided" ? "selected" : ""}>offen</option>
                                    <option value="declined" ${existing?.status === "declined" ? "selected" : ""}>abgesagt</option>
                                </select>
                            </label>
                        `;
        }).join("")}
                </div>

                <div class="actions">
                    <button id="save" class="primary">
                        ${this.#editMode ? "Speichern" : "Erstellen"}
                    </button>
                    <button id="cancel">Abbrechen</button>
                </div>
            </div>
        `;

        // Tags verwalten → Event nach außen werfen
        this.shadowRoot.querySelector("#manage-tags")
            ?.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("open-tag-manager", {
                    bubbles: true
                }));
            });

        // Speichern eingabe und speichert daten im Model
        this.shadowRoot.querySelector("#save").onclick = () => {
            const titleInput = this.shadowRoot.querySelector("#title");
            const error = this.shadowRoot.querySelector(".error");

            if (titleInput.value.trim() === "") {
                error.hidden = false;
                titleInput.focus();
                return;
            }
            error.hidden = true;

            const participants = [
                ...this.shadowRoot.querySelectorAll('input[name="participant"]:checked')
            ].map(cb => {
                const select = this.shadowRoot.querySelector(
                    `select[data-id="${cb.value}"]`
                );
                return {
                    participantId: cb.value,
                    status: select.value
                };
            });

            const tagIds = [
                ...this.shadowRoot.querySelectorAll('input[name="tag"]:checked')
            ].map(cb => cb.value);

            const data = {
                title: titleInput.value.trim(),
                datetime: this.shadowRoot.querySelector("#datetime").value,
                location: this.shadowRoot.querySelector("#location").value,
                description: this.shadowRoot.querySelector("#description").value,
                status: this.shadowRoot.querySelector("#status").value,
                participants,
                tagIds
            };

            if (this.#editMode) {
                model.updateEvent(this.#event.id, data);
            } else {
                model.addEvent(data);
            }
        };

        this.shadowRoot.querySelector("#cancel").onclick = () => {
            this.#editMode = false;
            model.selectEvent(undefined);
        };
    }

    updateTagCheckboxes() {
        const container = this.shadowRoot.querySelector(".tags");
        if (!container) return;

        const checked = [
            ...this.shadowRoot.querySelectorAll('input[name="tag"]:checked')
        ].map(cb => cb.value);

        container.innerHTML = `
        ${model.tags.map(tag => `
            <label class="check">
                <input
                    type="checkbox"
                    name="tag"
                    value="${tag.id}"
                    ${checked.includes(tag.id) ? "checked" : ""}
                >
                <span>${tag.title}</span>
            </label>
        `).join("")}
    `;
    }



    /* Formatierung */

    get styles() {
        return `
            :host {
                display: block;
                height: 100%;
            }

            .detail {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 8px;
            }

            .title {
                margin: 0;
                font-size: 1.6rem;
            }

            .meta {
                margin-bottom: 20px;
                font-size: 0.9rem;
                opacity: 0.7;
            }

            .section {
                display: flex;
                flex-direction: column;
                gap: 6px;
                margin-bottom: 20px;
            }
            


            .label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.6;
            }

            ul {
                margin: 0;
                padding-left: 18px;
            }

            .actions {
                margin-top: auto;
                display: flex;
                gap: 8px;
                padding-top: 16px;
            }

            button {
                padding: 10px 14px;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                background-color: var(--bg-elev);
                cursor: pointer;
            }

            button.primary {
                background-color: var(--primary);
                color: white;
                border: none;
            }

            label {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            label.check {
                flex-direction: row;
                align-items: center;
                gap: 8px;
            }

            input,
            textarea,
            select {
                padding: 8px 10px;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                background-color: var(--bg-elev);
            }

            .error {
                color: #c62828;
                font-size: 0.75rem;
            }

            .empty {
                opacity: 0.6;
                padding: 16px;
            }
        `;
    }
}

customElements.define("event-detail", EventDetail);

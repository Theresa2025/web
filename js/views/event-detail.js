import { model } from "../model/model.js";

class EventDetail extends HTMLElement {
    #event;
    #editMode = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.handleEventChanged = this.handleEventChanged.bind(this);
    }

    connectedCallback() {
        model.addEventListener("event-changed", this.handleEventChanged);
        this.#event = model.currentEvent;
        this.render();
    }

    disconnectedCallback() {
        model.removeEventListener("event-changed", this.handleEventChanged);
    }

    handleEventChanged(e) {
        this.#event = e.detail.event;
        this.#editMode = false;
        this.render();
    }

    render() {
        if (!this.#event) {
            this.shadowRoot.innerHTML = `
                <p>Bitte Event auswählen …</p>
            `;
            return;
        }

        if (this.#editMode) {
            this.shadowRoot.innerHTML = `
                <style>
                    label { display: block; margin-top: 0.5em; }
                </style>

                <h2>Event bearbeiten</h2>

                <label>Titel
                    <input id="title" value="${this.#event.title}">
                </label>

                <label>Ort
                    <input id="location" value="${this.#event.location}">
                </label>

                <label>Beschreibung
                    <textarea id="description">${this.#event.description}</textarea>
                </label>

                <label>Status
                    <select id="status">
                        <option value="geplant" ${this.#event.status === "geplant" ? "selected" : ""}>geplant</option>
                        <option value="abgeschlossen" ${this.#event.status === "abgeschlossen" ? "selected" : ""}>abgeschlossen</option>
                    </select>
                </label>

                <button id="save">Speichern</button>
                <button id="cancel">Abbrechen</button>
            `;

            this.shadowRoot.querySelector("#save").addEventListener("click", () => {
                model.updateEvent(this.#event.id, {
                    title: this.shadowRoot.querySelector("#title").value,
                    location: this.shadowRoot.querySelector("#location").value,
                    description: this.shadowRoot.querySelector("#description").value,
                    status: this.shadowRoot.querySelector("#status").value
                });
            });

            this.shadowRoot.querySelector("#cancel").addEventListener("click", () => {
                this.#editMode = false;
                this.render();
            });

            return;
        }

        // VIEW MODE
        this.shadowRoot.innerHTML = `
            <style>
                button { margin-right: 0.5em; }
            </style>

            <h2>${this.#event.title}</h2>
            <p><strong>Ort:</strong> ${this.#event.location}</p>
            <p><strong>Status:</strong> ${this.#event.status}</p>
            <p>${this.#event.description}</p>

            <button id="edit">Bearbeiten</button>
            <button id="delete">Löschen</button>
        `;

        this.shadowRoot.querySelector("#edit").addEventListener("click", () => {
            this.#editMode = true;
            this.render();
        });

        this.shadowRoot.querySelector("#delete").addEventListener("click", () => {
            if (confirm("Event wirklich löschen?")) {
                model.deleteEvent(this.#event.id);
            }
        });
    }
}

if (!customElements.get("event-detail")) {
    customElements.define("event-detail", EventDetail);
}

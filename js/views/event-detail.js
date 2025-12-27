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

    mapParticipationStatus(status) {
        if (status === "accepted") return "zugesagt";
        if (status === "declined") return "abgesagt";
        if (status === "undecided") return "offen";
        return status;
    }

    /* =====================
       CREATE MODE
    ====================== */
    renderCreateForm() {
        this.shadowRoot.innerHTML = `
            <h2>Neues Event anlegen</h2>

            <label>Titel
                <input id="title">
            </label>

            <label>Datum & Uhrzeit
                <input id="datetime" type="datetime-local">
            </label>

            <label>Ort
                <input id="location">
            </label>

            <label>Beschreibung
                <textarea id="description"></textarea>
            </label>

            <label>Status
                <select id="status">
                    <option value="geplant">geplant</option>
                    <option value="abgeschlossen">abgeschlossen</option>
                </select>
            </label>

            <h3>Tags</h3>
            ${model.tags.map(tag => `
                <label>
                    <input type="checkbox" name="tag" value="${tag.id}">
                    ${tag.title}
                </label>
            `).join("")}

            <h3>Teilnehmer</h3>
            ${model.participants.map(p => `
                <label>
                    <input type="checkbox" name="participant" value="${p.id}">
                    ${p.name}
                </label>
            `).join("")}

            <div style="margin-top:1em">
                <button id="create">Event erstellen</button>
                <button id="cancel">Abbrechen</button>
            </div>
        `;

        this.shadowRoot.querySelector("#create").addEventListener("click", () => {
            const participants = [
                ...this.shadowRoot.querySelectorAll('input[name="participant"]:checked')
            ].map(cb => ({
                participantId: cb.value,
                status: "undecided"
            }));

            const tags = [
                ...this.shadowRoot.querySelectorAll('input[name="tag"]:checked')
            ].map(cb => cb.value);

            model.addEvent({
                title: this.shadowRoot.querySelector("#title").value,
                datetime: this.shadowRoot.querySelector("#datetime").value,
                location: this.shadowRoot.querySelector("#location").value,
                description: this.shadowRoot.querySelector("#description").value,
                status: this.shadowRoot.querySelector("#status").value,
                tags,
                participants
            });
        });

        this.shadowRoot.querySelector("#cancel").addEventListener("click", () => {
            model.selectEvent(undefined);
        });
    }

    render() {
        /* CREATE MODE */
        if (this.#event === null) {
            this.renderCreateForm();
            return;
        }

        /* NOTHING SELECTED */
        if (!this.#event) {
            this.shadowRoot.innerHTML = `<p>Bitte Event auswählen …</p>`;
            return;
        }

        /* =====================
           EDIT MODE
        ====================== */
        if (this.#editMode) {
            this.shadowRoot.innerHTML = `
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

                <h3>Teilnehmer</h3>
                ${this.#event.participants.map(p => {
                const person = model.getParticipantById(p.participantId);
                return `
                        <label>
                            ${person?.name}
                            <select data-id="${p.participantId}">
                                <option value="accepted" ${p.status === "accepted" ? "selected" : ""}>zugesagt</option>
                                <option value="undecided" ${p.status === "undecided" ? "selected" : ""}>offen</option>
                                <option value="declined" ${p.status === "declined" ? "selected" : ""}>abgesagt</option>
                            </select>
                        </label>
                    `;
            }).join("")}

                <button id="save">Speichern</button>
                <button id="cancel">Abbrechen</button>
            `;

            this.shadowRoot.querySelector("#save").addEventListener("click", () => {
                const updatedParticipants = [
                    ...this.shadowRoot.querySelectorAll("select[data-id]")
                ].map(sel => ({
                    participantId: sel.dataset.id,
                    status: sel.value
                }));

                model.updateEvent(this.#event.id, {
                    title: this.shadowRoot.querySelector("#title").value,
                    location: this.shadowRoot.querySelector("#location").value,
                    description: this.shadowRoot.querySelector("#description").value,
                    status: this.shadowRoot.querySelector("#status").value,
                    participants: updatedParticipants
                });
            });

            this.shadowRoot.querySelector("#cancel").addEventListener("click", () => {
                this.#editMode = false;
                this.render();
            });

            return;
        }

        /* =====================
           VIEW MODE
        ====================== */
        this.shadowRoot.innerHTML = `
            <h2>${this.#event.title}</h2>
            <p><strong>Ort:</strong> ${this.#event.location}</p>
            <p><strong>Status:</strong> ${this.#event.status}</p>
            <p>${this.#event.description}</p>

            <p><strong>Tags:</strong>
                ${this.#event.tags?.length
            ? this.#event.tags.map(t => model.getTagTitle(t)).join(", ")
            : "keine"}
            </p>

            <h3>Teilnehmer</h3>
            <ul>
                ${this.#event.participants.map(p => {
            const person = model.getParticipantById(p.participantId);
            return `
                        <li>
                            ${person?.name}
                            (${this.mapParticipationStatus(p.status)})
                        </li>
                    `;
        }).join("")}
            </ul>

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

customElements.define("event-detail", EventDetail);

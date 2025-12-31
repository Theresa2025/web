import { model } from "../model/model.js";


//EventDetail -> Web Component -> rendert Detailansicht und reagiert auf Model Events
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

    //Reagiert auf Model -> aktuallisiert und rendert neu
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

    //entscheidet welche Ansicht gezeigt wird
    render() {
        if (this.#event === null) {
            this.renderCreateForm();
            return;
        }

        if (!this.#event) {
            this.shadowRoot.innerHTML = `
                <style>${this.styles}</style>
                <div class="empty">Bitte Event auswählen …</div>
            `;
            return;
        }

        if (this.#editMode) {
            this.renderEditForm();
            return;
        }

        this.renderViewMode();
    }

    /* Detailansicht */
    renderViewMode() {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="card">
                <h2 class="title">${this.#event.title}</h2>

                <div class="meta">
                    ${this.#event.location} • ${this.#event.status}
                </div>

                <div class="section">
                    <div class="label">Beschreibung</div>
                    <p>${this.#event.description || "Keine Beschreibung"}</p>
                </div>

                <div class="section">
                    <div class="label">Tags</div>
                    <p>
                        ${
            this.#event.tagIds.length
                ? this.#event.tagIds.map(id => model.getTagTitle(id)).join(", ")
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
                                    ${person?.name}
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

    /* Bearbeitung */
    renderEditForm() {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="card">
                <h2>Event bearbeiten</h2>

                <label>
                    Titel
                    <input id="title" value="${this.#event.title}">
                </label>

                <label>
                    Ort
                    <input id="location" value="${this.#event.location}">
                </label>

                <label>
                    Beschreibung
                    <textarea id="description">${this.#event.description}</textarea>
                </label>

                <label>
                    Status
                    <select id="status">
                        <option value="geplant" ${this.#event.status === "geplant" ? "selected" : ""}>geplant</option>
                        <option value="abgeschlossen" ${this.#event.status === "abgeschlossen" ? "selected" : ""}>abgeschlossen</option>
                    </select>
                </label>

                <div class="section">
                    <div class="label">Tags</div>
                    ${model.tags.map(tag => `
                        <label class="check">
                            <input
                                type="checkbox"
                                name="tag"
                                value="${tag.id}"
                                ${this.#event.tagIds.includes(tag.id) ? "checked" : ""}
                            >
                            <span>${tag.title}</span>
                        </label>
                    `).join("")}
                </div>

                <div class="section">
                    <div class="label">Teilnehmer</div>
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
                </div>

                <div class="actions">
                    <button id="save" class="primary">Speichern</button>
                    <button id="cancel">Abbrechen</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector("#save").onclick = () => {
            const tagIds = [
                ...this.shadowRoot.querySelectorAll('input[name="tag"]:checked')
            ].map(cb => cb.value);

            const participants = [
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
                tagIds,
                participants
            });
        };

        this.shadowRoot.querySelector("#cancel").onclick = () => {
            this.#editMode = false;
            this.render();
        };
    }

    /* Neu Erstellen */
    renderCreateForm() {
        this.shadowRoot.innerHTML = `
            <style>${this.styles}</style>

            <div class="card">
                <h2>Neues Event</h2>

                <label>
                    Titel
                    <input id="title">
                </label>

                <label>
                    Datum & Uhrzeit
                    <input id="datetime" type="datetime-local">
                </label>

                <label>
                    Ort
                    <input id="location">
                </label>

                <label>
                    Beschreibung
                    <textarea id="description"></textarea>
                </label>

                <label>
                    Status
                    <select id="status">
                        <option value="geplant">geplant</option>
                        <option value="abgeschlossen">abgeschlossen</option>
                    </select>
                </label>

                <div class="section">
                    <div class="label">Tags</div>
                    ${model.tags.map(tag => `
                        <label class="check">
                            <input type="checkbox" name="tag" value="${tag.id}">
                            <span>${tag.title}</span>
                        </label>
                    `).join("")}
                </div>

                <div class="section">
                    <div class="label">Teilnehmer</div>
                    ${model.participants.map(p => `
                        <label class="check">
                            <input type="checkbox" name="participant" value="${p.id}">
                            <span>${p.name}</span>
                        </label>
                    `).join("")}
                </div>

                <div class="actions">
                    <button id="create" class="primary">Erstellen</button>
                    <button id="cancel">Abbrechen</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector("#create").onclick = () => {
            const tagIds = [
                ...this.shadowRoot.querySelectorAll('input[name="tag"]:checked')
            ].map(cb => cb.value);

            const participants = [
                ...this.shadowRoot.querySelectorAll('input[name="participant"]:checked')
            ].map(cb => ({
                participantId: cb.value,
                status: "undecided"
            }));

            model.addEvent({
                title: this.shadowRoot.querySelector("#title").value,
                datetime: this.shadowRoot.querySelector("#datetime").value,
                location: this.shadowRoot.querySelector("#location").value,
                description: this.shadowRoot.querySelector("#description").value,
                status: this.shadowRoot.querySelector("#status").value,
                tagIds,
                participants
            });
        };

        this.shadowRoot.querySelector("#cancel").onclick = () => {
            model.selectEvent(undefined);
        };
    }

    /* Formatieren, durch Shadow Dom wird das normal formatieren in scss verhintert
    * (abekapselt), deswegen hier  */
    get styles() {
        return `
            :host {
                display: block;
                height: 100%;
            }

            .card {
                background-color: var(--bg-elev);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                height: 100%;
            }

            .title {
                margin: 0;
                font-size: 1.6rem;
            }

            .meta {
                font-size: 0.9rem;
                opacity: 0.7;
            }

            .section {
                display: flex;
                flex-direction: column;
                gap: 6px;
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

            .empty {
                opacity: 0.6;
                padding: 16px;
            }
        `;
    }
}

//Registierung der Web Component -> kann im HTML verwendet werden
customElements.define("event-detail", EventDetail);

import { model } from "../model/model.js";

class ParticipantDetail extends HTMLElement {
    #participant;
    #editMode = false;

    connectedCallback() {
        model.addEventListener("participant-changed", (e) => {
            this.#participant = e.detail.participant;
            this.#editMode = false;
            this.render();
        });

        this.#participant = model.currentParticipant;
        this.render();
    }

    render() {

        /* noch keiner ausgewähtl */
        if (this.#participant === undefined) {
            this.innerHTML = `
        <div class="empty">
            Bitte Teilnehmer auswählen …
        </div>
    `;
            return;
        }
        /* Neuer Teilnehmer */
        if (this.#participant === null) {
            this.innerHTML = `
                <h3>Neuer Teilnehmer</h3>

                <label>
                    Name
                    <input id="name">
                </label>

                <label>
                    E-Mail
                    <input id="email" type="email">
                </label>

                <button id="save">Speichern</button>
            `;

            this.querySelector("#save").onclick = () => {
                const name = this.querySelector("#name").value.trim();
                const email = this.querySelector("#email").value.trim();

                if (!name || !email) {
                    alert("Name und E-Mail sind Pflichtfelder.");
                    return;
                }

                //im Model angelegt und auswahlt zurückgesetzt
                model.addParticipant({ name, email });
                model.selectParticipant(undefined);
            };
            return;
        }

        /* Teilnehmer bearbeiten */
        if (this.#editMode) {
            this.innerHTML = `
                <h3>Teilnehmer bearbeiten</h3>

                <label>
                    Name
                    <input id="name" value="${this.#participant.name}">
                </label>

                <label>
                    E-Mail
                    <input id="email" type="email" value="${this.#participant.email}">
                </label>

                <button id="save">Speichern</button>
                <button id="cancel">Abbrechen</button>
            `;

            this.querySelector("#save").onclick = () => {
                const name = this.querySelector("#name").value.trim();
                const email = this.querySelector("#email").value.trim();

                if (!name || !email) {
                    alert("Name und E-Mail sind Pflichtfelder.");
                    return;
                }

                model.updateParticipant(this.#participant.id, { name, email });
            };

            this.querySelector("#cancel").onclick = () => {
                this.#editMode = false;
                this.render();
            };

            return;
        }

        /* Anzeigen */
        this.innerHTML = `
            <h3>${this.#participant.name}</h3>
            <p>${this.#participant.email}</p>

            <button id="edit">Bearbeiten</button>
            <button id="delete">Löschen</button>
        `;

        this.querySelector("#edit").onclick = () => {
            this.#editMode = true;
            this.render();
        };

        this.querySelector("#delete").onclick = () => {
            if (confirm("Teilnehmer wirklich löschen?")) {
                model.deleteParticipant(this.#participant.id);
                model.selectParticipant(undefined);
            }
        };
    }
}

customElements.define("participant-detail", ParticipantDetail);

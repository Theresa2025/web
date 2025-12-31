import { model } from "../model/model.js";

class ParticipantFilter extends HTMLElement {

    connectedCallback() {
        this.render();

        model.addEventListener("model-ready", () => this.render());
    }

    render() {
        const participants = model.participants ?? [];
        const current = model.participantFilter ?? "all";

        this.innerHTML = `
            <label>
                Teilnehmer:
                <select id="participant">
                    <option value="all">Alle</option>
                    ${participants.map(p => `
                        <option value="${p.id}" ${p.id === current ? "selected" : ""}>
                            ${p.name}
                        </option>
                    `).join("")}
                </select>
            </label>
        `;

        //Filter im Model setzten -> dispatcht-> neu rendern
        this.querySelector("#participant").onchange = (e) => {
            model.setParticipantFilter(e.target.value);
        };
    }
}

if (!customElements.get("participant-filter")) {
    customElements.define("participant-filter", ParticipantFilter);
}

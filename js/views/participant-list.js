import { model } from "../model/model.js";

class ParticipantList extends HTMLElement {

    connectedCallback() {
        this.render();

        model.addEventListener("model-ready", () => this.render());
        model.addEventListener("participants-changed", () => this.render());
        model.addEventListener("participant-changed", () => this.render());
    }

    render() {
        const currentId = model.currentParticipant?.id;

        this.innerHTML = `
            <div class="list-actions">
                <button id="btn-new-participant">
                    + Neuer Teilnehmer
                </button>
            </div>

            <ul class="list">
                ${model.participants.map(p => `
                    <li
                        data-id="${p.id}"
                        class="${p.id === currentId ? "active" : ""}"
                    >
                        ${p.name}
                    </li>
                `).join("")}
            </ul>
        `;

        this.querySelector("#btn-new-participant").onclick = () => {
            model.selectParticipant(null);
        };

        this.querySelectorAll("li[data-id]").forEach(li => {
            li.onclick = () => {
                this.dispatchEvent(new CustomEvent("select-participant", {
                    bubbles: true,
                    composed: true,
                    detail: { id: li.dataset.id }
                }));
            };
        });
    }
}

customElements.define("participant-list", ParticipantList);

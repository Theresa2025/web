import { model } from "../model/model.js";

class ParticipantFilter extends HTMLElement {
    connectedCallback() {
        this.render();
        model.addEventListener("model-ready", () => this.render());
    }

    render() {
        this.innerHTML = `
      <label>
        Teilnehmer:
        <select id="p">
          <option value="all">Alle</option>
          ${model.participants.map(p => `
            <option value="${p.id}">${p.name}</option>
          `).join("")}
        </select>
      </label>
    `;

        this.querySelector("#p").addEventListener("change", e => {
            model.setParticipantFilter(e.target.value);
        });
    }
}

customElements.define("participant-filter", ParticipantFilter);

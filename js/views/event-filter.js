import { model } from "../model/model.js";

class EventFilter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <label>
                Status:
                <select id="status">
                    <option value="all">Alle</option>
                    <option value="geplant">Geplant</option>
                    <option value="abgeschlossen">Abgeschlossen</option>
                </select>
            </label>
        `;

        const select = this.querySelector("#status");

        // ✅ WICHTIG: Model-Filter initial setzen
        select.value = "all";
        model.setStatusFilter("all");

        select.addEventListener("change", (e) => {
            model.setStatusFilter(e.target.value);
        });
    }
}

if (!customElements.get("event-filter")) {
    customElements.define("event-filter", EventFilter);
}

import { model } from "../model/model.js";

class EventList extends HTMLElement {
    connectedCallback() {
        this.render();

        model.addEventListener("addEvent", () => this.render());
        model.addEventListener("deleteEvent", () => this.render());
        model.addEventListener("updateEvent", () => this.render());
        model.addEventListener("filter-changed", () => this.render());

        // ✅ DAS WAR DER FEHLENDE TEIL
        model.addEventListener("model-ready", () => this.render());
    }


    render() {
        this.innerHTML = "<ul></ul>";
        const ul = this.querySelector("ul");

        for (const ev of model.filteredEvents) {
            const li = document.createElement("li");
            li.textContent = ev.title;

            li.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("select-event", {
                    bubbles: true,
                    detail: { id: ev.id }
                }));
            });

            ul.appendChild(li);
        }
    }
}

if (!customElements.get("event-list")) {
    customElements.define("event-list", EventList);
}

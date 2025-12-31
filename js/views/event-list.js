import { model } from "../model/model.js";

class EventList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        //Daten geladen -> neu rendern
        model.addEventListener("model-ready", () => this.render());
        //Filter änderung -> aktualisieren
        model.addEventListener("filter-changed", () => this.render());
        //Events hinnzugefügt/gelöscht -> anteigen
        model.addEventListener("events-changed", () => this.render());
        //Event ausgewählt -> markieren
        model.addEventListener("event-changed", () => this.render());
    }

    render() {
        const currentId = model.currentEvent?.id;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                li {
                    padding: 12px 14px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background-color 0.15s ease, transform 0.1s ease;
                }

                li:hover {
                    background-color: rgba(0, 0, 0, 0.04);
                    transform: translateY(-1px);
                }

                li.active {
                    background-color: rgba(16, 185, 129, 0.18);
                    border-left: 4px solid var(--primary);
                    font-weight: 600;
                }

                .title {
                    font-weight: 600;
                }

                .meta {
                    font-size: 0.85em;
                    color: #555;
                }
            </style>

            <ul>
                ${model.filteredEvents.map(ev => `
                    <li
                        data-id="${ev.id}"
                        class="${ev.id === currentId ? "active" : ""}"
                    >
                        <div class="title">${ev.title}</div>
                        <div class="meta">
                            ${new Date(ev.datetime).toLocaleString()}
                        </div>
                    </li>
                `).join("")}
            </ul>
        `;

        this.shadowRoot.querySelectorAll("li").forEach(li => {
            li.addEventListener("click", () => {
                const id = li.dataset.id;

                //Event wurde augewählt
                // wird nicht im Model geändert -> Controller
                this.dispatchEvent(
                    new CustomEvent("select-event", {
                        bubbles: true, //-> bubbelt nach oben im DOM
                        composed: true, //-> verlässt Shadow DOM
                        detail: { id } //-> Event- ID
                    })
                );
            });
        });
    }
}

//für HTML -> event-list
customElements.define("event-list", EventList);

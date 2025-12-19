import { model } from "../model/model.js";

/* =======================
   EVENT ITEM
======================= */
class EventItem extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    set event(ev) {
        this.#event = ev;
        this.render();
    }

    get event() {
        return this.#event;
    }

    render() {
        if (!this.#event) return;

        this.shadowRoot.innerHTML = `
      <style>
        li { cursor: pointer; padding: .75em; border-bottom: 1px solid #ddd; }
        li:hover { background: #f3f4f6; }
        .title { font-weight: 600; }
        .meta { font-size: .85em; color: #555; }
      </style>

      <li>
        <div class="title">${this.#event.title}</div>
        <div class="meta">
          ${new Date(this.#event.datetime).toLocaleString()}
        </div>
      </li>
    `;

        this.shadowRoot.querySelector("li").onclick = () => {
            this.dispatchEvent(new CustomEvent("select-event", {
                bubbles: true,
                composed: true,
                detail: { eventId: this.#event.id }
            }));
        };
    }
}
customElements.define("event-item", EventItem);

/* =======================
   EVENT LIST
======================= */
class EventList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        model.addEventListener("addEvent", e => this.addEvent(e.detail));
        model.addEventListener("deleteEvent", e => this.removeEvent(e.detail.id));
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        ul { list-style: none; padding: 0; margin: 0; }
      </style>
      <ul></ul>
    `;

        for (const [, ev] of model.events) {
            this.addEvent(ev);
        }
    }

    addEvent(ev) {
        const item = document.createElement("event-item");
        item.event = ev;
        this.shadowRoot.querySelector("ul").appendChild(item);
    }

    removeEvent(id) {
        this.shadowRoot.querySelectorAll("event-item").forEach(item => {
            if (item.event.id === id) item.remove();
        });
    }
}
customElements.define("event-list", EventList);

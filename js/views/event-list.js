class EventList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        // 👂 Observer – exakt wie addContact in Übung 5
        model.addEventListener("addEvent", (e) => {
            this.addEvent(e.detail);
        });

        model.addEventListener("deleteEvent", (e) => {
            this.removeEvent(e.detail.id);
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
      <style>
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      </style>
      <ul class="eventlist"></ul>
    `;

        for (const [, ev] of model.events) {
            this.addEvent(ev);
        }
    }

    addEvent(ev) {
        const list = this.shadowRoot.querySelector("ul");
        const item = document.createElement("event-item");
        item.event = ev;
        list.appendChild(item);
    }

    removeEvent(eventId) {
        this.shadowRoot.querySelectorAll("event-item").forEach(item => {
            if (item.event.id === eventId) {
                item.remove();
            }
        });
    }
}

customElements.define("event-list", EventList);

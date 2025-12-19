import { model } from "../model/model.js";

class EventDetail extends HTMLElement {
    #event;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();

        // 👂 Observer – wie message-view / header-view in Übung 5
        model.addEventListener("event-changed", (e) => {
            this.event = e.detail.event;
        });
    }

    set event(ev) {
        this.#event = ev;
        this.render();
    }

    render() {
        if (!this.#event) {
            this.shadowRoot.innerHTML = `
        <p style="padding:1em;color:#666">
          Bitte Event auswählen …
        </p>`;
            return;
        }

        this.shadowRoot.innerHTML = `
      <style>
        .box {
          padding: 1.5em;
          font-family: Inter, system-ui, sans-serif;
        }
        h2 { margin-top: 0; }
        .meta { color: #555; margin-bottom: 1em; }
        .label { font-weight: 600; }
      </style>

      <div class="box">
        <h2>${this.#event.title}</h2>
        <div class="meta">
          📅 ${new Date(this.#event.datetime).toLocaleString()}<br>
          📍 ${this.#event.location}
        </div>
        <p>${this.#event.description}</p>
        <p><span class="label">Status:</span> ${this.#event.status}</p>
      </div>
    `;
    }
}

customElements.define("event-detail", EventDetail);

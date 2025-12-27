import { model } from "../model/model.js";

class TagFilter extends HTMLElement {
    constructor() {
        super();
        this.handleModelReady = this.handleModelReady.bind(this);
    }

    connectedCallback() {
        // Initial render (zeigt zumindest "Alle Tags")
        this.render();

        // 👂 WICHTIG: auf JSON-Load reagieren
        model.addEventListener("model-ready", this.handleModelReady);
    }

    disconnectedCallback() {
        model.removeEventListener("model-ready", this.handleModelReady);
    }

    handleModelReady() {
        console.log("[TagFilter] model-ready → render()");
        this.render();
    }

    render() {
        this.innerHTML = `
            <label>
                Tag:
                <select id="tag">
                    <option value="all">Alle Tags</option>
                    ${model.tags.map(tag => `
                        <option value="${tag.id}">
                            ${tag.title}
                        </option>
                    `).join("")}
                </select>
            </label>
        `;

        this.querySelector("#tag").addEventListener("change", (e) => {
            model.setTagFilter(e.target.value);
        });
    }
}

if (!customElements.get("tag-filter")) {
    customElements.define("tag-filter", TagFilter);
}

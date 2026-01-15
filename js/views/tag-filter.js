import { model } from "../model/model.js";

class TagFilter extends HTMLElement {

    connectedCallback() {
        // Initiales Rendern
        this.render();

        model.addEventListener("model-ready", () => this.render());
        model.addEventListener("tags-changed", () => this.render());
    }

    render() {
        const current = model.tagFilter ?? "all";

        this.innerHTML = `
        <label>
            Tags
            <select id="tag-filter">
                <option value="all">Alle Tags</option>
                ${model.tags.map(tag => `
                    <option
                        value="${tag.id}"
                        ${tag.id === current ? "selected" : ""}
                    >
                        ${tag.title}
                    </option>
                `).join("")}
            </select>
        </label>
    `;

        this.querySelector("#tag-filter").onchange = e => {
            model.setTagFilter(e.target.value);
        };
    }

}

if (!customElements.get("tag-filter")) {
    customElements.define("tag-filter", TagFilter);
}

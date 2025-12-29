import { model } from "../model/model.js";

class TagFilter extends HTMLElement {

    connectedCallback() {
        this.render();

        model.addEventListener("model-ready", () => this.render());
    }

    render() {
        const tags = model.tags ?? [];
        const current = model.tagFilter ?? "all";

        this.innerHTML = `
            <label>
                Tag:
                <select id="tag">
                    <option value="all">Alle</option>
                    ${tags.map(t => `
                        <option value="${t.id}" ${t.id === current ? "selected" : ""}>
                            ${t.title}
                        </option>
                    `).join("")}
                </select>
            </label>
        `;

        this.querySelector("#tag").onchange = (e) => {
            model.setTagFilter(e.target.value);
        };
    }
}

if (!customElements.get("tag-filter")) {
    customElements.define("tag-filter", TagFilter);
}

import { model } from "../model/model.js";

class TagList extends HTMLElement {

    connectedCallback() {
        this.render();

        model.addEventListener("model-ready", () => this.render());
        model.addEventListener("tags-changed", () => this.render());
        model.addEventListener("tag-changed", () => this.render());
    }

    render() {
        const currentId = model.currentTag?.id;

        this.innerHTML = `
            <div class="list-actions">
                <button id="btn-new-tag">+ Neuer Tag</button>
            </div>

            <ul class="list">
                ${model.tags.map(tag => `
                    <li
                        data-id="${tag.id}"
                        class="${tag.id === currentId ? "active" : ""}"
                    >
                        ${tag.title}
                    </li>
                `).join("")}
            </ul>
        `;

        this.querySelector("#btn-new-tag").onclick = () => {
            model.selectTag(null);
        };

        this.querySelectorAll("li[data-id]").forEach(li => {
            li.onclick = () => {
                this.dispatchEvent(new CustomEvent("select-tag", {
                    bubbles: true,
                    composed: true,
                    detail: { id: li.dataset.id }
                }));
            };
        });
    }
}

customElements.define("tag-list", TagList);

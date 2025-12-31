import { model } from "../model/model.js";



class TagList extends HTMLElement {

    connectedCallback() {
        this.render();

        model.addEventListener("model-ready", () => this.render());
        model.addEventListener("tags-changed", () => this.render());
        model.addEventListener("tag-changed", () => this.render());
    }

    render() {
        console.log("TagList render, derzeitiger Tag:", model.currentTag);
        const currentId = model.currentTag?.id;

        this.innerHTML = `
            <style>
                button {
                    margin-bottom: 0.5rem;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                li {
                    padding: 0.6em 0.8em;
                    cursor: pointer;
                    border-radius: 6px;
                }

                li:hover {
                    background: rgba(0,0,0,0.05);
                }

                li.active {
                    background: rgba(16, 185, 129, 0.18);
                    font-weight: 600;
                }
            </style>

            <button id="btn-new-tag">
                + Neuer Tag
            </button>

            <ul>
                ${model.tags.map(t => `
                    <li
                        data-id="${t.id}"
                        class="${t.id === currentId ? "active" : ""}"
                    >
                        ${t.title}
                    </li>
                `).join("")}
            </ul>
        `;

        this.querySelector("#btn-new-tag").onclick = () => {
            model.selectTag(null);
        };

        this.querySelectorAll("li[data-id]").forEach(li => {
            li.onclick = () => {
                console.log("✅ TAG GEKLICKT:", li.dataset.id);
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

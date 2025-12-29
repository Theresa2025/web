import { model } from "../model/model.js";

class TagDetail extends HTMLElement {
    #tag;
    #editMode = false;

    connectedCallback() {
        model.addEventListener("tag-changed", (e) => {
            this.#tag = e.detail.tag;
            this.#editMode = false;
            this.render();
        });

        this.#tag = model.currentTag;
        this.render();
    }

    render() {

        /* =====================
           NOTHING SELECTED
        ====================== */
        if (this.#tag === undefined) {
            this.innerHTML = "<p>Tag auswählen …</p>";
            return;
        }

        /* =====================
           CREATE MODE
        ====================== */
        if (this.#tag === null) {
            this.innerHTML = `
                <h3>Neuer Tag</h3>

                <label>
                    Titel
                    <input id="title">
                </label>

                <button id="save">Anlegen</button>
            `;

            this.querySelector("#save").onclick = () => {
                const title = this.querySelector("#title").value.trim();
                if (!title) {
                    alert("Titel darf nicht leer sein");
                    return;
                }

                model.addTag({ title });
                model.selectTag(undefined);
            };

            return;
        }

        /* =====================
           EDIT MODE
        ====================== */
        if (this.#editMode) {
            this.innerHTML = `
                <h3>Tag bearbeiten</h3>

                <label>
                    Titel
                    <input id="title" value="${this.#tag.title}">
                </label>

                <button id="save">Speichern</button>
                <button id="cancel">Abbrechen</button>
            `;

            this.querySelector("#save").onclick = () => {
                const title = this.querySelector("#title").value.trim();
                if (!title) {
                    alert("Titel darf nicht leer sein");
                    return;
                }

                model.updateTag(this.#tag.id, { title });
            };

            this.querySelector("#cancel").onclick = () => {
                this.#editMode = false;
                this.render();
            };

            return;
        }

        /* =====================
           VIEW MODE
        ====================== */
        this.innerHTML = `
            <h3>${this.#tag.title}</h3>

            <button id="edit">Bearbeiten</button>
            <button id="delete">Löschen</button>
        `;

        this.querySelector("#edit").onclick = () => {
            this.#editMode = true;
            this.render();
        };

        this.querySelector("#delete").onclick = () => {
            if (confirm("Tag wirklich löschen?")) {
                model.deleteTag(this.#tag.id);
                model.selectTag(undefined);
            }
        };
    }
}

customElements.define("tag-detail", TagDetail);

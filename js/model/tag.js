// Tag repräsentiert ein Schlagwort für Events
export default class Tag {

    #id;
    #title;

    constructor({ id, title }) {
        this.#id = id;
        this.#title = title;
    }

    // Getters
    get id() { return this.#id; }
    get title() { return this.#title; }

    // Setters Bearbeiten des Tag-Namens
    set title(v) { this.#title = v; }
}

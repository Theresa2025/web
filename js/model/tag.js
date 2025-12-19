export default class Tag {
    #id;
    #title;

    constructor({ id, title }) {
        this.#id = id;
        this.#title = title;
    }

    get id() { return this.#id; }
    get title() { return this.#title; }

    set title(v) { this.#title = v; }
}

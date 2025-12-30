// Participant repräsentiert eine Person im System
export default class Participant {

    #id;
    #name;
    #email;
    #avatar;

    constructor({ id, name, email, avatar }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#avatar = avatar ?? null;
    }

    // Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }
    get avatar() { return this.#avatar; }


    // Setters wichtig für Bearbeiten im UI
    set name(v) { this.#name = v; }
    set email(v) { this.#email = v; }
    set avatar(v) { this.#avatar = v; }
}

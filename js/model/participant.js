// Participant repräsentiert eine Person im System
export default class Participant {

    #id;
    #name;
    #email;

    constructor({ id, name, email }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
    }

    // Getters
    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }

    // automatisch generiertes Kürzel (Avatar-Fallback)
    get initials() {
        return this.#name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase();
    }

    // Setters wichtig für Bearbeiten im UI
    set name(v) { this.#name = v; }
    set email(v) { this.#email = v; }
}

// Participant repräsentiert eine Person im System
// → Domain Object (Model), keine UI, kein DOM
export default class Participant {

    #id;
    #name;
    #email;
    #avatar; // optional (URL, Emoji, Initialen)

    /**
     * Konstruktor bekommt ein Objekt
     * → konsistent mit EventItem
     */
    constructor({ id, name, email, avatar }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#avatar = avatar ?? null;
    }

    // ===== GETTER =====
    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }
    get avatar() { return this.#avatar; }

    // ===== SETTER =====
    // wichtig für Bearbeiten im UI
    set name(v) { this.#name = v; }
    set email(v) { this.#email = v; }
    set avatar(v) { this.#avatar = v; }
}

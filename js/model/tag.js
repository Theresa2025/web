// Tag repräsentiert ein Schlagwort für Events
// → Domain Object (Model), keine UI, kein DOM
export default class Tag {

    #id;     // eindeutige Tag-ID (z. B. "t1")
    #title;  // Anzeigename des Tags

    /**
     * Konstruktor mit Objekt-Parameter
     * → konsistent mit EventItem & Participant
     */
    constructor({ id, title }) {
        this.#id = id;
        this.#title = title;
    }

    // ===== GETTER =====
    get id() { return this.#id; }
    get title() { return this.#title; }

    // ===== SETTER =====
    // Bearbeiten des Tag-Namens
    set title(v) { this.#title = v; }
}

export default class EventItem {
    #id;
    #title;
    #description;
    #datetime;
    #location;
    #status;
    #tagIds;        // ["t1","t2"]
    #participants;  // [{participantId:"p1", status:"accepted"}]

    constructor({ id, title, description, datetime, location, status, tags, participants }) {
        this.#id = id;
        this.#title = title;
        this.#description = description ?? "";
        this.#datetime = datetime;
        this.#location = location ?? "";
        this.#status = status ?? "planned";
        this.#tagIds = tags ?? [];
        this.#participants = participants ?? [];
    }

    get id() { return this.#id; }
    get title() { return this.#title; }
    get description() { return this.#description; }
    get datetime() { return this.#datetime; }
    get location() { return this.#location; }
    get status() { return this.#status; }
    get tagIds() { return this.#tagIds; }
    get participants() { return this.#participants; }

    // kleine Setter (für späteres Update)
    set title(v) { this.#title = v; }
    set description(v) { this.#description = v; }
    set datetime(v) { this.#datetime = v; }
    set location(v) { this.#location = v; }
    set status(v) { this.#status = v; }

    set tagIds(v) { this.#tagIds = Array.isArray(v) ? v : []; }
    set participants(v) { this.#participants = Array.isArray(v) ? v : []; }
}

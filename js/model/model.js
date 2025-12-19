import EventItem from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";

class EventBuddyModel extends EventTarget {
    #events;
    #participants;
    #tags;

    #currentEvent; // selected EventItem or undefined

    constructor() {
        super();
        this.#events = new Map();
        this.#participants = new Map();
        this.#tags = new Map();
        this.#currentEvent = undefined;

        this.#loadFromJSON();
    }

    // ===== GETTER wie in Übung 5 =====
    get events() { return this.#events; }
    get participants() { return this.#participants; }
    get tags() { return this.#tags; }
    get currentEvent() { return this.#currentEvent; }

    getEventById(id) { return this.#events.get(id); }
    getParticipantById(id) { return this.#participants.get(id); }
    getTagById(id) { return this.#tags.get(id); }

    // ===== EVENTS CRUD (später Controller nutzt das) =====
    addEvent(eventObj) {
        const e = eventObj instanceof EventItem ? eventObj : new EventItem(eventObj);
        this.#events.set(e.id, e);

        this.dispatchEvent(new CustomEvent("addEvent", { detail: e }));
        // optional: wenn erstes Event, direkt selektieren
        if (!this.#currentEvent) this.selectEvent(e.id);
    }

    selectEvent(eventId) {
        const selected = this.getEventById(eventId);
        this.#currentEvent = selected;

        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: selected }
        }));

        return selected;
    }

    updateEvent(eventId, patch) {
        const e = this.getEventById(eventId);
        if (!e) return;

        // Patch anwenden (minimal, wie man es in Übungen oft macht)
        if (patch.title !== undefined) e.title = patch.title;
        if (patch.description !== undefined) e.description = patch.description;
        if (patch.datetime !== undefined) e.datetime = patch.datetime;
        if (patch.location !== undefined) e.location = patch.location;
        if (patch.status !== undefined) e.status = patch.status;
        if (patch.tags !== undefined) e.tagIds = patch.tags;
        if (patch.participants !== undefined) e.participants = patch.participants;

        this.dispatchEvent(new CustomEvent("updateEvent", { detail: e }));

        // wenn gerade selected: detail view soll auch update bekommen
        if (this.#currentEvent?.id === eventId) {
            this.dispatchEvent(new CustomEvent("event-changed", { detail: { event: e } }));
        }
    }

    deleteEvent(eventId) {
        const existed = this.#events.delete(eventId);

        if (existed) {
            this.dispatchEvent(new CustomEvent("deleteEvent", { detail: { id: eventId } }));

            // selection fallback
            if (this.#currentEvent?.id === eventId) {
                const first = this.#events.values().next().value;
                this.#currentEvent = first ?? undefined;
                this.dispatchEvent(new CustomEvent("event-changed", { detail: { event: this.#currentEvent } }));
            }
        }
    }

    // ===== TAG CRUD (für später) =====
    addTag(tagObj) {
        const t = tagObj instanceof Tag ? tagObj : new Tag(tagObj);
        this.#tags.set(t.id, t);
        this.dispatchEvent(new CustomEvent("addTag", { detail: t }));
    }

    // Regel: Tag darf nur gelöscht werden, wenn ungenutzt
    deleteTag(tagId) {
        const usedSomewhere = [...this.#events.values()].some(ev => (ev.tagIds ?? []).includes(tagId));
        if (usedSomewhere) {
            this.dispatchEvent(new CustomEvent("error", {
                detail: { message: "Tag kann nicht gelöscht werden (wird noch verwendet)." }
            }));
            return;
        }

        const existed = this.#tags.delete(tagId);
        if (existed) this.dispatchEvent(new CustomEvent("deleteTag", { detail: { id: tagId } }));
    }

    // ===== JSON LOAD (wie #loadFromJSON in Übung 5) =====
    #loadFromJSON() {
        fetch("json/data.json")
            .then(res => res.json())
            .then(data => {
                // participants
                for (const p of data.participants ?? []) {
                    const participant = new Participant(p);
                    this.#participants.set(participant.id, participant);
                    this.dispatchEvent(new CustomEvent("addParticipant", { detail: participant }));
                }

                // tags
                for (const t of data.tags ?? []) {
                    const tag = new Tag(t);
                    this.#tags.set(tag.id, tag);
                    this.dispatchEvent(new CustomEvent("addTag", { detail: tag }));
                }

                // events
                for (const e of data.events ?? []) {
                    this.addEvent(new EventItem(e));
                }

                // wenn addEvent nichts selektiert hat (z.B. keine events), trotzdem initial signalisieren
                this.dispatchEvent(new CustomEvent("model-ready", { detail: {} }));
            })
            .catch(err => {
                this.dispatchEvent(new CustomEvent("error", {
                    detail: { message: "Fehler beim Laden der JSON: " + err.message }
                }));
            });
    }
}

export const model = new EventBuddyModel();

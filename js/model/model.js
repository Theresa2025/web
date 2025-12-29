import EventItem from "./event.js";

console.log("📦 GELADEN: model.js");

class EventBuddyModel extends EventTarget {

    /* =====================
       STATE
    ====================== */
    #events = new Map();        // id → EventItem
    #participants = new Map(); // id → plain object (später Domain Object)
    #tags = new Map();         // id → plain object

    #currentEvent = undefined;        // undefined | null | EventItem
    #currentParticipant = undefined; // undefined | null | Participant
    #currentTag = undefined;         // undefined | null | Tag

    #statusFilter = "all";
    #tagFilter = "all";
    #participantFilter = "all";

    constructor() {
        super();
        this.loadFromJSON();
    }

    /* =====================
       JSON LOADING
    ====================== */
    async loadFromJSON() {
        try {
            const res = await fetch("./json/data.json");
            const data = await res.json();

            // Teilnehmer (noch einfache Objekte)
            for (const p of data.participants ?? []) {
                this.#participants.set(p.id, p);
            }

            // Tags (noch einfache Objekte)
            for (const t of data.tags ?? []) {
                this.#tags.set(t.id, t);
            }

            // Events → Domain Objects
            for (const e of data.events ?? []) {
                const eventItem = new EventItem({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    datetime: e.datetime,
                    location: e.location,
                    status: this.mapStatus(e.status),
                    tags: e.tags,
                    participants: e.participants
                });

                this.#events.set(eventItem.id, eventItem);
            }

            console.log("[Model] Initial State", {
                events: this.#events,
                participants: this.#participants,
                tags: this.#tags
            });

            this.dispatchEvent(new CustomEvent("model-ready"));
        } catch (err) {
            console.error("[Model] JSON load failed", err);
        }
    }

    mapStatus(status) {
        if (status === "planned") return "geplant";
        if (status === "done") return "abgeschlossen";
        return status;
    }

    /* =====================
       GETTERS
    ====================== */

    get filteredEvents() {
        let events = [...this.#events.values()];

        if (this.#statusFilter !== "all") {
            events = events.filter(e => e.status === this.#statusFilter);
        }

        if (this.#tagFilter !== "all") {
            events = events.filter(e => e.tagIds.includes(this.#tagFilter));
        }

        if (this.#participantFilter !== "all") {
            events = events.filter(e =>
                e.participants.some(
                    p => p.participantId === this.#participantFilter
                )
            );
        }

        return events;
    }

    get events() {
        return [...this.#events.values()];
    }

    get participants() {
        return [...this.#participants.values()];
    }
    get participantFilter() {
        return this.#participantFilter;
    }


    get tags() {
        return [...this.#tags.values()];
    }

    get currentEvent() {
        return this.#currentEvent;
    }

    get currentParticipant() {
        return this.#currentParticipant;
    }

    getParticipantById(id) {
        return this.#participants.get(id);
    }


    // Helper für Views
    getTagTitle(id) {
        return this.#tags.get(id)?.title ?? id;
    }

    /* =====================
       EVENT CRUD
    ====================== */

    addEvent(eventData) {
        const event = eventData instanceof EventItem
            ? eventData
            : new EventItem({
                ...eventData,
                id: eventData.id ?? "e" + crypto.randomUUID()
            });

        this.#events.set(event.id, event);

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.selectEvent(event.id);
    }

    selectEvent(id) {
        this.#currentEvent = (id === null) ? null : this.#events.get(id);

        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: this.#currentEvent }
        }));
    }

    updateEvent(id, patch) {
        const ev = this.#events.get(id);
        if (!ev) return;

        if ("title" in patch) ev.title = patch.title;
        if ("description" in patch) ev.description = patch.description;
        if ("datetime" in patch) ev.datetime = patch.datetime;
        if ("location" in patch) ev.location = patch.location;
        if ("status" in patch) ev.status = patch.status;
        if ("tags" in patch) ev.tagIds = patch.tags;
        if ("participants" in patch) ev.participants = patch.participants;

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.selectEvent(id);
    }

    deleteEvent(id) {
        this.#events.delete(id);
        this.#currentEvent = undefined;

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: null }
        }));
    }

    /* =====================
       PARTICIPANTS CRUD
    ====================== */

    addParticipant(p) {
        p.id ??= "p" + crypto.randomUUID();
        this.#participants.set(p.id, p);
        this.dispatchEvent(new CustomEvent("participants-changed"));
    }

    selectParticipant(id) {
        this.#currentParticipant = (id === null)
            ? null
            : this.#participants.get(id);

        this.dispatchEvent(new CustomEvent("participant-changed", {
            detail: { participant: this.#currentParticipant }
        }));
    }

    updateParticipant(id, patch) {
        const p = this.#participants.get(id);
        if (!p) return;

        Object.assign(p, patch);
        this.dispatchEvent(new CustomEvent("participants-changed"));
        this.selectParticipant(id);
    }

    deleteParticipant(id) {
        const used = [...this.#events.values()].some(
            e => e.participants.some(p => p.participantId === id)
        );

        if (used) {
            alert("Teilnehmer ist noch Events zugeordnet.");
            return;
        }

        this.#participants.delete(id);
        this.dispatchEvent(new CustomEvent("participants-changed"));
    }

    /* =====================
       TAGS CRUD
    ====================== */

    addTag(tag) {
        tag.id ??= "t" + crypto.randomUUID();
        this.#tags.set(tag.id, tag);
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    selectTag(id) {
        this.#currentTag = (id === null) ? null : this.#tags.get(id);

        this.dispatchEvent(new CustomEvent("tag-changed", {
            detail: { tag: this.#currentTag }
        }));
    }

    updateTag(id, patch) {
        const t = this.#tags.get(id);
        if (!t) return;

        Object.assign(t, patch);
        this.dispatchEvent(new CustomEvent("tags-changed"));
        this.selectTag(id);
    }

    deleteTag(id) {
        const used = [...this.#events.values()].some(
            e => e.tagIds.includes(id)
        );

        if (used) {
            alert("Tag wird noch verwendet.");
            return;
        }

        this.#tags.delete(id);
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    /* =====================
       FILTER
    ====================== */

    setStatusFilter(v) {
        this.#statusFilter = v;
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }

    setTagFilter(v) {
        this.#tagFilter = v;
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }

    setParticipantFilter(v) {
        this.#participantFilter = v;
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }
}

export const model = new EventBuddyModel();

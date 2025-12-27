class EventBuddyModel extends EventTarget {
    #events = new Map();
    #participants = new Map();
    #tags = new Map();

    #currentEvent = undefined;   // undefined | null | Event
    #statusFilter = "all";
    #tagFilter = "all";
    #participantFilter = "all"; // 🆕 NEU

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

            // Participants
            for (const p of data.participants ?? []) {
                this.#participants.set(p.id, p);
            }

            // Tags
            for (const t of data.tags ?? []) {
                this.#tags.set(t.id, t);
            }

            // Events
            for (const e of data.events ?? []) {
                e.status = this.mapStatus(e.status);
                this.#events.set(e.id, e);
            }

            console.log("[Model] JSON geladen:", {
                events: this.#events,
                tags: this.#tags,
                participants: this.#participants
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

        // Status-Filter
        if (this.#statusFilter !== "all") {
            events = events.filter(e => e.status === this.#statusFilter);
        }

        // Tag-Filter
        if (this.#tagFilter !== "all") {
            events = events.filter(e => e.tags?.includes(this.#tagFilter));
        }

        // 🆕 Teilnehmer-Filter
        if (this.#participantFilter !== "all") {
            events = events.filter(e =>
                (e.participants ?? []).some(
                    p => p.participantId === this.#participantFilter
                )
            );
        }

        return events;
    }

    get currentEvent() {
        return this.#currentEvent;
    }

    getEventById(id) {
        return this.#events.get(id);
    }

    /* =====================
       TAGS
    ====================== */

    get tags() {
        return [...this.#tags.values()];
    }

    getTagTitle(tagId) {
        return this.#tags.get(tagId)?.title ?? tagId;
    }

    /* =====================
       PARTICIPANTS
    ====================== */

    get participants() {
        return [...this.#participants.values()];
    }

    getParticipantById(id) {
        return this.#participants.get(id);
    }

    /* =====================
       EVENT CRUD
    ====================== */

    addEvent(event) {
        if (!event.id) {
            event.id = "e" + crypto.randomUUID();
        }

        this.#events.set(event.id, event);

        console.log("[Model] addEvent:", event);

        this.dispatchEvent(new CustomEvent("addEvent", {
            detail: { event }
        }));

        this.selectEvent(event.id);
    }

    selectEvent(id) {
        if (id === null) {
            this.#currentEvent = null;
            console.log("[Model] selectEvent: CREATE MODE");
        } else {
            this.#currentEvent = this.#events.get(id);
            console.log("[Model] selectEvent:", this.#currentEvent);
        }

        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: this.#currentEvent }
        }));
    }

    updateEvent(id, patch) {
        const ev = this.#events.get(id);
        if (!ev) return;

        Object.assign(ev, patch);

        console.log("[Model] updateEvent:", ev);

        this.dispatchEvent(new CustomEvent("updateEvent"));
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: ev }
        }));
    }

    deleteEvent(id) {
        this.#events.delete(id);
        this.#currentEvent = undefined;

        console.log("[Model] deleteEvent:", id);

        this.dispatchEvent(new CustomEvent("deleteEvent"));
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: null }
        }));
    }

    /* =====================
       FILTER
    ====================== */


    setStatusFilter(status) {
        this.#statusFilter = status;
        console.log("[Model] statusFilter gesetzt:", status);
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }

    setTagFilter(tagId) {
        this.#tagFilter = tagId;
        console.log("[Model] tagFilter gesetzt:", tagId);
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }

    // 🆕 Teilnehmer-Filter setzen
    setParticipantFilter(participantId) {
        this.#participantFilter = participantId;
        console.log("[Model] participantFilter gesetzt:", participantId);
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }
    addTag(tag) {
        if (!tag.id) tag.id = "t" + crypto.randomUUID();
        this.#tags.set(tag.id, tag);
        console.log("[Model] addTag:", tag);
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    updateTag(id, patch) {
        const t = this.#tags.get(id);
        if (!t) return;
        Object.assign(t, patch);
        console.log("[Model] updateTag:", t);
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    deleteTag(id) {
        // Regel: Tag darf nur gelöscht werden, wenn unbenutzt
        const used = [...this.#events.values()].some(ev => (ev.tags ?? []).includes(id));
        if (used) {
            this.dispatchEvent(new CustomEvent("error", {
                detail: { message: "Tag kann nicht gelöscht werden (wird in einem Event verwendet)." }
            }));
            return false;
        }
        this.#tags.delete(id);
        console.log("[Model] deleteTag:", id);
        this.dispatchEvent(new CustomEvent("tags-changed"));
        return true;
    }

}

export const model = new EventBuddyModel();

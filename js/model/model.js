class EventBuddyModel extends EventTarget {
    #events = new Map();
    #participants = new Map();
    #tags = new Map();

    #currentEvent;
    #statusFilter = "all";

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

            this.dispatchEvent(new CustomEvent("model-ready"));
        } catch (err) {
            console.error("JSON load failed", err);
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
        if (this.#statusFilter === "all") {
            return [...this.#events.values()];
        }
        return [...this.#events.values()].filter(
            e => e.status === this.#statusFilter
        );
    }

    get currentEvent() {
        return this.#currentEvent;
    }

    getEventById(id) {
        return this.#events.get(id);
    }

    /* =====================
       EVENT ACTIONS
    ====================== */

    selectEvent(id) {
        this.#currentEvent = this.#events.get(id);
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: this.#currentEvent }
        }));
    }

    updateEvent(id, patch) {
        const ev = this.#events.get(id);
        if (!ev) return;

        Object.assign(ev, patch);

        this.dispatchEvent(new CustomEvent("updateEvent"));
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: ev }
        }));
    }

    deleteEvent(id) {
        this.#events.delete(id);
        this.#currentEvent = undefined;

        this.dispatchEvent(new CustomEvent("deleteEvent"));
        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: null }
        }));
    }

    setStatusFilter(status) {
        this.#statusFilter = status;
        this.dispatchEvent(new CustomEvent("filter-changed"));
    }
}

export const model = new EventBuddyModel();

import EventItem from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";

console.log("model.js wird geladen");

// Model = Subject (EventTarget)
//Views und Controller können sich als Listener registrieren
class EventBuddyModel extends EventTarget {

    // Map-> über ID
    #events = new Map();
    #participants = new Map();
    #tags = new Map();

    // aktuelle Auswahl -> undefined (nichts ausgwählt)
    #currentEvent = undefined;
    #currentParticipant = undefined;

    // Filter
    #statusFilter = "all";
    #tagFilter = "all";
    #participantFilter = "all";

    constructor() {
        super();
        this.loadFromJSON();
    }

    /*Daten laden */
    async loadFromJSON() {
        try {
            const res = await fetch("./json/data.json");
            const data = await res.json();

            // Teilnehmer
            for (const p of data.participants ?? []) {
                const participant = new Participant(p);
                this.#participants.set(participant.id, participant);
            }

            // Tags (global, aber UI-gebunden an Events)
            for (const t of data.tags ?? []) {
                const tag = new Tag(t);
                this.#tags.set(tag.id, tag);
            }

            // Events
            for (const e of data.events ?? []) {
                const eventItem = new EventItem({
                    id: e.id,
                    title: e.title,
                    description: e.description,
                    datetime: e.datetime,
                    location: e.location,
                    status: this.mapStatus(e.status),
                    tagIds: e.tags ?? [],
                    participants: e.participants ?? []
                });

                this.#events.set(eventItem.id, eventItem);
            }

            //Daten fertig geladen-> Views dürfen rendern
            this.dispatchEvent(new CustomEvent("model-ready"));
        } catch (err) {
            console.error("Fehler beim Laden der Daten", err);
        }
    }

    mapStatus(status) {
        if (status === "planned") return "geplant";
        if (status === "done") return "abgeschlossen";
        return status;
    }

    /* Getter -> zugfriff von außen*/
    get events() {
        return [...this.#events.values()];
    }

    get participants() {
        return [...this.#participants.values()];
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

    getTagTitle(id) {
        return this.#tags.get(id)?.title ?? id;
    }
    get tagFilter() {
        return this.#tagFilter;
    }


    // Gefilterte Events (Listenansicht)
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
                e.participants.some(p => p.participantId === this.#participantFilter)
            );
        }

        return events;
    }

    /* Events
    * ID generieren und Observer informieren*/
    addEvent(event) {
        if (!event.title?.trim()) {
            throw new Error("Event-Titel ist verpflichtend");
        }

        if (!event.id) {
            event.id = "e" + Date.now();
        }

        event.tagIds ??= [];
        event.participants ??= [];

        this.#events.set(event.id, event);

        console.log("[MODEL] dispatch events-changed");
        this.dispatchEvent(new CustomEvent("events-changed"));

        this.selectEvent(event.id);
    }

    /*Event auswählen, undefined -> nichts, null-> neues */

    selectEvent(id) {
        if (id === undefined) {
            this.#currentEvent = undefined;   // nichts ausgewählt
        } else if (id === null) {
            this.#currentEvent = null;        // neues Event anlegen
        } else {
            this.#currentEvent = this.#events.get(id);
        }

        this.dispatchEvent(new CustomEvent("event-changed", {
            detail: { event: this.#currentEvent }
        }));
    }

    updateEvent(id, patch) {
        const ev = this.#events.get(id);
        if (!ev) return;

        //Bestehende Daten aktualisieren-> ?? ignoriert null/undefined
        /*Beim Patch-Prinzip übergebe ich nur die geänderten Werte.
        Alles andere bleibt unverändert.
        Das ist effizienter und verhindert, dass Daten verloren gehen*/
        Object.assign(ev, {
            title: patch.title ?? ev.title,
            description: patch.description ?? ev.description,
            location: patch.location ?? ev.location,
            status: patch.status ?? ev.status,
        });

        if (Array.isArray(patch.tagIds)) ev.tagIds = patch.tagIds;
        if (Array.isArray(patch.participants)) ev.participants = patch.participants;

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.selectEvent(id);
    }

    deleteEvent(id) {
        this.#events.delete(id);
        this.#currentEvent = undefined;

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.dispatchEvent(new CustomEvent("event-changed", { detail: { event: undefined } }));
    }

    /* Teilnehmer */
    addParticipant(data) {
        data.id ??= "p" + Date.now();
        const p = new Participant(data);
        this.#participants.set(p.id, p);

        this.dispatchEvent(new CustomEvent("participants-changed"));
    }

    selectParticipant(id) {
        if (id === undefined) {
            this.#currentParticipant = undefined; // nichts ausgewählt
        } else if (id === null) {
            this.#currentParticipant = null;      // neuer Teilnehmer
        } else {
            this.#currentParticipant = this.#participants.get(id);
        }

        this.dispatchEvent(new CustomEvent("participant-changed", {
            detail: { participant: this.#currentParticipant }
        }));
    }


    updateParticipant(id, patch) {
        const p = this.#participants.get(id);
        if (!p) return;

        Object.assign(p, patch);
        this.dispatchEvent(new CustomEvent("participants-changed"));
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

    /* Tags */
    addTag(title) {
        console.log("[MODEL] addTag()", title);
        title = title?.trim();
        if (!title) return null;

        for (const t of this.#tags.values()) {
            if (t.title.toLowerCase() === title.toLowerCase()) {
                return t;
            }
        }

        const tag = new Tag({ id: "t" + Date.now(), title });
        this.#tags.set(tag.id, tag);

        this.dispatchEvent(new CustomEvent("tags-changed"));
        return tag;
    }

    updateTag(id, title) {
        const t = this.#tags.get(id);
        if (!t) return;

        t.title = title.trim();
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    deleteTag(id) {
        const used = [...this.#events.values()].some(e => e.tagIds.includes(id));

        if (used) {
            alert("Tag kann nicht gelöscht werden – er wird noch verwendet.");
            return;
        }

        this.#tags.delete(id);
        this.dispatchEvent(new CustomEvent("tags-changed"));
    }

    /* Filter */
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

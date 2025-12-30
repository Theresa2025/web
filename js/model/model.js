import EventItem from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";


console.log("📦 GELADEN: model.js");

class EventBuddyModel extends EventTarget {

    //Maps-> schneller und über ID
    #events = new Map();
    #participants = new Map();
    #tags = new Map();

    /*Aktuelle Auswahl*/
    #currentEvent = undefined;
    #currentParticipant = undefined;
    #currentTag = undefined;

    #statusFilter = "all";
    #tagFilter = "all";
    #participantFilter = "all";

    constructor() {
        super();
        this.loadFromJSON();
    }

    /* Daten Laden -> data.json */
    async loadFromJSON() {
        try {
            const res = await fetch("./json/data.json");
            const data = await res.json();

            // Teilnehmer
            for (const p of data.participants ?? []) {
                const participant = new Participant(p);
                this.#participants.set(participant.id, participant);

            }

            // Tags
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

    //übersetzung von json
    mapStatus(status) {
        if (status === "planned") return "geplant";
        if (status === "done") return "abgeschlossen";
        return status;
    }

    /* getters*/

    //gibt Events mit aklutellen Filter zurück
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
    get currentTag() {
        return this.#currentTag;
    }


    get currentEvent() {
        return this.#currentEvent;
    }

    get currentParticipant() {
        return this.#currentParticipant;
    }

    //für die View -> liefert Teilnehmer über ID
    getParticipantById(id) {
        return this.#participants.get(id);
    }

    //für View -> Titel eines Tags (ID)
    getTagTitle(id) {
        return this.#tags.get(id)?.title ?? id;
    }

    /* Event */
    addEvent(event) {
        if (event.id == null) {
            event.id = "e" + Date.now();
        }


        event.tagIds = Array.isArray(event.tagIds) ? event.tagIds : [];
        event.participants = Array.isArray(event.participants) ? event.participants : [];

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

        ev.title = patch.title ?? ev.title;
        ev.location = patch.location ?? ev.location;
        ev.description = patch.description ?? ev.description;
        ev.status = patch.status ?? ev.status;

        if (Array.isArray(patch.tagIds)) {
            ev.tagIds = patch.tagIds;
        }

        if (Array.isArray(patch.participants)) {
            ev.participants = patch.participants;
        }

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

    /* Teilnehmer */
    addParticipant(p) {
        if (p.id == null) {
            p.id = "p" + Date.now();
        }

        const participant = new Participant(p);
        this.#participants.set(participant.id, participant);

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

    /* Tags */

    addTag(tagData) {
        if (tagData.id == null) {
            tagData.id = "t" + Date.now();
        }

        const tag = new Tag(tagData);
        this.#tags.set(tag.id, tag);

        this.dispatchEvent(new CustomEvent("tags-changed"));
    }



    selectTag(id) {
        this.#currentTag = (id === null) ? null : this.#tags.get(id);

        console.log("✅ MODEL currentTag:", this.#currentTag);
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

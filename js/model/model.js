import EventItem from "./event.js";
import Participant from "./participant.js";
import Tag from "./tag.js";

console.log("model.js wird geladen");

//EventTarget = Subject, Views= Observer, dispatchEvent() = Benachrichtigung
class EventBuddyModel extends EventTarget {

    //Daten liegen im Model
    //Maps-> schneller und über ID
    #events = new Map();
    #participants = new Map();
    #tags = new Map();

    //Aktuelle Auswahl
    #currentEvent = undefined;
    #currentParticipant = undefined;
    #currentTag = undefined;

    //Filtereinstellung
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
            // --> ?? wenn etwas leer ist liefert es dann einen leeren Array
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
                    tagIds: e.tags ?? [],
                    participants: e.participants ?? []
                });

                this.#events.set(eventItem.id, eventItem);
            }

            console.log("Model: werden alle Daten geladen: ", {
                events: this.#events,
                participants: this.#participants,
                tags: this.#tags
            });

            //Daten laden fertig: -> für View-> rendern
            this.dispatchEvent(new CustomEvent("model-ready"));
        } catch (err) {
            console.error("Model: Fehler beim Datenladen", err);
        }
    }

    //übersetzung von json
    mapStatus(status) {
        if (status === "planned") return "geplant";
        if (status === "done") return "abgeschlossen";
        return status;
    }

    // getters -> views dürfen lesen

    //gibt Events mit aktuellen Filter zurück
    get filteredEvents() {
        //... verwandelt Map in Array damit Filtern funktioniert
        let events = [...this.#events.values()];

        //Filtern für Status
        if (this.#statusFilter !== "all") {
            events = events.filter(e => e.status === this.#statusFilter);
        }

        //Filtern für Tags
        if (this.#tagFilter !== "all") {
            events = events.filter(e => e.tagIds.includes(this.#tagFilter));
        }

        //Filtern für Teilnehmer
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

    // Event
    addEvent(event) {

        if (!event.title || event.title.trim() === "") {
            throw new Error("Event-Titel ist verpflichtend");
        }

        // falls neues Event → ID erzeugen
        if (event.id == null) {
            event.id = "e" + Date.now();
        }

        // sicherstellen, dass Arrays existieren
        if (!Array.isArray(event.tagIds)) {
            event.tagIds = [];
        }

        if (!Array.isArray(event.participants)) {
            event.participants = [];
        }

        // im Model speichern
        this.#events.set(event.id, event);

        // Views informieren
        this.dispatchEvent(new CustomEvent("events-changed"));

        // neues Event automatisch auswählen
        this.selectEvent(event.id);
    }

    selectEvent(id) {
        if (id === null) {
            this.#currentEvent = null;
        } else {
            this.#currentEvent = this.#events.get(id);
        }

        //Detailansicht aktualisieren
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

    // Teilnehmer
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

        p.name = patch.name ?? p.name;
        p.email = patch.email ?? p.email;
        p.avatar = patch.avatar ?? p.avatar;

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

    // Tags

    // ➕ erweitert: String ODER Objekt möglich + Rückgabewert
    addTag(tagData) {

        const title = typeof tagData === "string"
            ? tagData.trim()
            : tagData.title?.trim();

        if (!title) return null;

        // prüfen ob Tag bereits existiert
        for (const t of this.#tags.values()) {
            if (t.title.toLowerCase() === title.toLowerCase()) {
                return t;
            }
        }

        const tag = new Tag({
            id: "t" + Date.now(),
            title,
            color: tagData.color ?? "#cccccc"
        });

        this.#tags.set(tag.id, tag);

        this.dispatchEvent(new CustomEvent("tags-changed"));

        return tag;
    }

    // ➕ NEU: Tag direkt einem Event zuordnen
    addTagToEvent(eventId, tagId) {
        const ev = this.#events.get(eventId);
        if (!ev) return;

        if (!Array.isArray(ev.tagIds)) {
            ev.tagIds = [];
        }

        if (!ev.tagIds.includes(tagId)) {
            ev.tagIds.push(tagId);
        }

        this.dispatchEvent(new CustomEvent("events-changed"));
        this.selectEvent(eventId);
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

        t.title = patch.title ?? t.title;
        t.color = patch.color ?? t.color;

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

    // Filter

    //Listenansicht neu rendern in der View
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

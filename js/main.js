import { model } from "./model/model.js";

// Views werden NUR hier importiert
import "./views/event-list.js";
import "./views/event-detail.js";
import "./views/event-filter.js";

// Event auswählen
document.addEventListener("select-event", (e) => {
    console.log("[Controller] select-event empfangen:", e.detail.id);
    model.selectEvent(e.detail.id);
});

// Event löschen
document.addEventListener("delete-event", (e) => {
    if (confirm("Event wirklich löschen?")) {
        model.deleteEvent(e.detail.id);
    }
});

// Event updaten
document.addEventListener("update-event", (e) => {
    console.log("[Controller] update-event:", e.detail);
    model.updateEvent(e.detail.id, e.detail.patch);
});

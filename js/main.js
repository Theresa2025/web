import { model } from "./model/model.js";

// Views werden NUR hier importiert
import "./views/event-list.js";
import "./views/event-detail.js";
import "./views/event-filter.js";
import "./views/tag-filter.js";

document.addEventListener("DOMContentLoaded", () => {

    // + Neues Event
    const btnNewEvent = document.getElementById("btn-new-event");
    if (btnNewEvent) {
        btnNewEvent.addEventListener("click", () => {
            console.log("[Controller] Neues Event anlegen");
            model.selectEvent(null);
        });
    }

    // Event auswählen (aus EventList)
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

});

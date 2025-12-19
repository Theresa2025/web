import { model } from "./model/model.js";

document.querySelector("event-list")
    .addEventListener("select-event", (e) => {
        console.log("▶ Event selected:", e.detail.eventId);
        model.selectEvent(e.detail.eventId);
    });

import { model } from "./model/model.js";

class Controller {

    constructor() {
        // absichtlich leer
    }

    init() {
        /* ==========================
           EVENT AUSWAHL
        ========================== */
        document.addEventListener("select-event", (e) => {
            console.log("[Controller] select-event", e.detail.id);
            model.selectEvent(e.detail.id);
        });

        document.addEventListener("select-participant", (e) => {
            console.log("[Controller] select-participant", e.detail.id);
            model.selectParticipant(e.detail.id);
        });

        /* ==========================
           VIEW SWITCH
        ========================== */
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.changeView(btn.dataset.view);
            });
        });
        document.addEventListener("select-tag", (e) => {
            model.selectTag(e.detail.id);
        });


        // Startansicht
        this.changeView("events");
    }

    changeView(view) {
        const sidebar = document.querySelector(".sidebar");
        const content = document.querySelector(".content");

        if (view === "events") {
            sidebar.innerHTML = `
                <button id="btn-new-event">+ Neues Event</button>
                <event-filter></event-filter>
                <tag-filter></tag-filter>
                <participant-filter></participant-filter>
                <event-list></event-list>
            `;
            content.innerHTML = `<event-detail></event-detail>`;

            document.getElementById("btn-new-event")
                .onclick = () => model.selectEvent(null);
        }

        if (view === "participants") {
            sidebar.innerHTML = `<participant-list></participant-list>`;
            content.innerHTML = `<participant-detail></participant-detail>`;
        }



        if (view === "tags") {
            sidebar.innerHTML = `<tag-list></tag-list>`;
            content.innerHTML = `<tag-detail></tag-detail>`;
        }

    }
}

export const controller = new Controller();

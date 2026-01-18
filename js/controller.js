import { model } from "./model/model.js";

class Controller {

    init() {
        console.log("[CONTROLLER] init()");
        // Auswahl aus Listen
        document.addEventListener("select-event", (e) => {
            console.log("[CONTROLLER] select-event empfangen:", e.detail.id);
            model.selectEvent(e.detail.id);
        });

        document.addEventListener("select-participant", (e) => {
            console.log("[CONTROLLER] select-participant empfangen:", e.detail.id);
            model.selectParticipant(e.detail.id);
        });

        // Navigation->  Event oder Teilnehmer Button
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.setActiveNav(btn);
                this.changeView(btn.dataset.view);
            });
        });

        // Startansicht
        const startBtn = document.querySelector('.nav-btn[data-view="events"]');
        if (startBtn) {
            this.setActiveNav(startBtn);
        }
        this.changeView("events");
    }

    setActiveNav(activeBtn) {
        document.querySelectorAll(".nav-btn").forEach(btn =>
            btn.classList.remove("active")
        );
        activeBtn.classList.add("active");
    }

    changeView(view) {
        const layout = document.querySelector(".layout");
        const sidebar = document.querySelector(".sidebar");
        const list = document.querySelector(".list-column");
        const detail = document.querySelector(".detail-column");

        // Zurücksetzten
        layout.className = "layout";
        sidebar.innerHTML = "";
        list.innerHTML = "";
        detail.innerHTML = "";

        if (view !== "events") {
            model.selectEvent(undefined);
        }
        if (view !== "participants") {
            model.selectParticipant(undefined);
        }

        /* Event -> 3 Spalten */
        if (view === "events") {
            layout.classList.add("layout--events");

            sidebar.innerHTML = `
                <button id="btn-new-event" class="primary">+ Neues Event</button>
                <event-filter></event-filter>
                <participant-filter></participant-filter>
                <tag-filter></tag-filter>
            `;

            list.innerHTML = `<event-list></event-list>`;
            detail.innerHTML = `<event-detail></event-detail>`;

            document.getElementById("btn-new-event")
                .onclick = () => model.selectEvent(null);
        }

        /* Teilnehmer -> 2 Spalten */
        if (view === "participants") {
            layout.classList.add("layout--participants");

            sidebar.innerHTML = `<participant-list></participant-list>`;
            detail.innerHTML = `<participant-detail></participant-detail>`;
        }
    }
}

export const controller = new Controller();

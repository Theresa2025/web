import { model } from "./model/model.js";

class Controller {

    init() {
        /* zb: View: es wurde was ausgewählt
        event list -> dispatchEvent-> controller model.selectEvent-> Model ändert Zustand */
        document.addEventListener("select-event", (e) => {
            model.selectEvent(e.detail.id);
        });

        document.addEventListener("select-participant", (e) => {
            model.selectParticipant(e.detail.id);
        });

        document.addEventListener("select-tag", (e) => {
            console.log("CONTROLLER ausgewählter Tag:", e.detail.id);
            model.selectTag(e.detail.id);
        });

        /* Ansicht wechsel */
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

        // reset
        layout.className = "layout";
        sidebar.innerHTML = "";
        list.innerHTML = "";
        detail.innerHTML = "";

        /* EVENTS → 3 SPALTEN */
        if (view === "events") {
            layout.classList.add("layout--events");

            sidebar.innerHTML = `
                <button id="btn-new-event">+ Neues Event</button>
                <event-filter></event-filter>
                <participant-filter></participant-filter>
                <tag-filter></tag-filter>
            `;

            list.innerHTML = `<event-list></event-list>`;
            detail.innerHTML = `<event-detail></event-detail>`;

            document.getElementById("btn-new-event")
                .onclick = () => model.selectEvent(null);
        }

        /* Teilnehmer → 2 SPALTEN */
        if (view === "participants") {
            layout.classList.add("layout--participants");

            sidebar.innerHTML = `<participant-list></participant-list>`;
            detail.innerHTML = `<participant-detail></participant-detail>`;
        }

        /* TAGS → 2 SPALTEN */
        if (view === "tags") {
            layout.classList.add("layout--tags");

            sidebar.innerHTML = `<tag-list></tag-list>`;
            detail.innerHTML = `<tag-detail></tag-detail>`;
        }
    }
}

export const controller = new Controller();

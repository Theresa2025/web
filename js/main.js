// Events
import "./views/event-list.js";
import "./views/event-detail.js";
import "./views/event-filter.js";

// Teilnehmer
import "./views/participant-list.js";
import "./views/participant-detail.js";
import "./views/participant-filter.js";


// Tag
import "./views/tag-manager-modal.js";
import "./views/tag-filter.js";

// Controller
import { controller } from "./controller.js";

window.controller = controller;
controller.init();

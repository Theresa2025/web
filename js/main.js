// EVENTS
import "./views/event-list.js";
import "./views/event-detail.js";
import "./views/event-filter.js";

// TEILNEHMER
import "./views/participant-list.js";
import "./views/participant-detail.js";
import "./views/participant-filter.js";


// TAGS
import "./views/tag-list.js";
import "./views/tag-detail.js";
import "./views/tag-filter.js";

// CONTROLLER
import { controller } from "./controller.js";

window.controller = controller; // Debug
controller.init();

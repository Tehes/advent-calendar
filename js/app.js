/* --------------------------------------------------------------------------------------------------
Imports
---------------------------------------------------------------------------------------------------*/

import { initServiceWorker } from "./service-worker-registration.js";

/* --------------------------------------------------------------------------------------------------
Constants and state
---------------------------------------------------------------------------------------------------*/

const USE_SERVICE_WORKER = false;
const SERVICE_WORKER_VERSION = "2026-03-12-v1";
const AUTO_RELOAD_ON_SW_UPDATE = true;
const DOOR_ORDER = [17, 6, 3, 12, 21, 8, 14, 5, 19, 1, 24, 10, 22, 9, 15, 7, 4, 11, 23, 2, 18, 13, 20, 16];
const doors = new Map();
const state = {
	isDevelopment: false,
	storageKey: "",
	year: null,
	opened: new Set(),
	midnightTimer: null,
	activeDay: null,
};

/* --------------------------------------------------------------------------------------------------
DOM references
---------------------------------------------------------------------------------------------------*/

const calendar = document.getElementById("calendar");
const doorTemplate = document.getElementById("doorTemplate");
const illustrationDialog = document.getElementById("illustrationDialog");
const illustrationImage = document.getElementById("illustrationImage");
const imageMessage = document.getElementById("imageMessage");
const closeDialog = document.getElementById("closeDialog");

/* --------------------------------------------------------------------------------------------------
Calendar date and persistence
---------------------------------------------------------------------------------------------------*/

function getAvailableDay(date, isDevelopment) {
	if (isDevelopment) {
		return 24;
	}
	return date.getMonth() === 11 ? Math.min(date.getDate(), 24) : 0;
}

function loadProgress() {
	try {
		const stored = JSON.parse(localStorage.getItem(state.storageKey));
		if (stored === null || stored.year !== state.year) {
			return;
		}
		if (
			!Array.isArray(stored.opened) ||
			stored.opened.some((day) => !Number.isInteger(day) || day < 1 || day > 24)
		) {
			throw new Error("Invalid calendar progress.");
		}
		state.opened = new Set(stored.opened);
	} catch (error) {
		console.warn("Calendar progress could not be loaded:", error);
	}
}

function saveProgress() {
	try {
		localStorage.setItem(state.storageKey, JSON.stringify({
			year: state.year,
			opened: [...state.opened],
		}));
	} catch (error) {
		console.warn("Calendar progress could not be saved:", error);
	}
}

function refreshCalendar() {
	const now = new Date();
	const year = now.getFullYear();
	if (state.year !== year) {
		const isFirstLoad = state.year === null;
		state.year = year;
		state.opened = new Set();
		if (isFirstLoad) {
			loadProgress();
		}
		saveProgress();
		if (illustrationDialog.open) {
			illustrationDialog.close();
		}
	}

	const availableDay = getAvailableDay(now, state.isDevelopment);
	for (const [day, door] of doors) {
		const isAvailable = day <= availableDay;
		const isOpened = isAvailable && state.opened.has(day);
		door.button.disabled = !isAvailable;
		door.button.title = isAvailable
			? `${isOpened ? "Close" : "Open"} December ${day}`
			: `Available on December ${day}`;
		door.number.hidden = isOpened;
		door.image.hidden = !isOpened;
		if (isOpened && !door.image.hasAttribute("src")) {
			door.image.src = `./img/Adventskalender_${day}.jpg`;
		}
	}

	if (state.activeDay !== null && state.activeDay > availableDay && illustrationDialog.open) {
		illustrationDialog.close();
	}

	clearTimeout(state.midnightTimer);
	const midnight = new Date(year, now.getMonth(), now.getDate() + 1);
	state.midnightTimer = setTimeout(refreshCalendar, midnight.getTime() - now.getTime());
}

/* --------------------------------------------------------------------------------------------------
Door rendering and illustration overlay
---------------------------------------------------------------------------------------------------*/

function renderDoors() {
	for (const [index, day] of DOOR_ORDER.entries()) {
		const fragment = doorTemplate.content.cloneNode(true);
		const button = fragment.querySelector("button");
		const number = fragment.querySelector(".number");
		const image = fragment.querySelector("img");
		number.textContent = day;
		image.alt = `Watercolour illustration for December ${day}`;
		button.classList.toggle("red", index % 2 !== 0);
		button.classList.toggle("tall", day === 6);
		button.classList.toggle("large", day === 24);
		button.addEventListener("click", () => handleDoorClick(day));
		doors.set(day, { button, number, image });
		calendar.append(fragment);
	}
}

function handleDoorClick(day) {
	refreshCalendar();
	if (doors.get(day).button.disabled) {
		return;
	}

	if (state.opened.has(day)) {
		state.opened.delete(day);
		saveProgress();
		refreshCalendar();
		return;
	}

	state.activeDay = day;
	illustrationImage.hidden = true;
	illustrationImage.alt = `Watercolour illustration for December ${day}`;
	imageMessage.textContent = "Loading illustration…";
	imageMessage.hidden = false;
	illustrationDialog.showModal();
	illustrationImage.src = `./img/Adventskalender_${day}.jpg`;
}

function handleImageLoad() {
	const day = state.activeDay;
	if (day === null || !illustrationDialog.open) {
		return;
	}

	// A load can finish after midnight, so recheck the calendar before saving it.
	refreshCalendar();
	if (!illustrationDialog.open) {
		return;
	}
	illustrationImage.hidden = false;
	imageMessage.hidden = true;
	state.opened.add(day);
	saveProgress();
	refreshCalendar();
}

function handleDialogClose() {
	const day = state.activeDay;
	state.activeDay = null;
	illustrationImage.removeAttribute("src");
	illustrationImage.hidden = true;
	if (day !== null) {
		doors.get(day).button.focus();
	}
}

/* --------------------------------------------------------------------------------------------------
Initialization
---------------------------------------------------------------------------------------------------*/

function init() {
	state.isDevelopment = globalThis.location.hostname === "localhost" ||
		globalThis.location.hostname === "127.0.0.1";
	state.storageKey = state.isDevelopment ? "advent-calendar-development" : "advent-calendar-progress";
	renderDoors();
	refreshCalendar();

	illustrationImage.addEventListener("load", handleImageLoad);
	illustrationImage.addEventListener("error", () => {
		if (state.activeDay === null || !illustrationDialog.open) {
			return;
		}
		console.warn(`Illustration for December ${state.activeDay} could not be loaded.`);
		imageMessage.textContent = "This illustration could not be loaded. Please close and try again.";
		imageMessage.hidden = false;
		illustrationImage.hidden = true;
	});
	closeDialog.addEventListener("click", () => illustrationDialog.close());
	illustrationDialog.addEventListener("close", handleDialogClose);
	illustrationDialog.addEventListener("click", (event) => {
		if (event.target !== illustrationDialog) {
			return;
		}
		const bounds = illustrationDialog.getBoundingClientRect();
		if (
			event.clientX < bounds.left || event.clientX > bounds.right ||
			event.clientY < bounds.top || event.clientY > bounds.bottom
		) {
			illustrationDialog.close();
		}
	});
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) {
			refreshCalendar();
		}
	});

	initServiceWorker({
		useServiceWorker: USE_SERVICE_WORKER,
		serviceWorkerVersion: SERVICE_WORKER_VERSION,
		autoReloadOnSwUpdate: AUTO_RELOAD_ON_SW_UPDATE,
	});
}

init();

// Keep date rules inspectable without changing the browser clock.
globalThis.app = { getAvailableDay };

# Advent Calendar

Twenty-four days of hand-painted watercolor illustrations. Open a door each day in December to reveal
its illustration, with a paper background and doors in Christmas red and fir green.

**Open the Calendar:** [Advent Calendar](https://tehes.github.io/advent-calendar/)

---

## Features

- **24 illustrations:** Each numbered door reveals a different watercolor illustration in a larger view.
- **A door a day:** Doors unlock on their December date, based on your device's local time. Earlier
  days remain available, so you can catch up whenever you like.
- **Remembered progress:** Opened doors stay revealed between visits in the same browser. Progress
  is saved locally for the current year and starts fresh each year.
- **Open and close:** Close a revealed door and open it again to revisit its illustration.
- **Responsive layout:** The calendar adapts to phones, tablets, and desktop screens, with larger
  doors for December 6 and 24.

---

## How to Use

1. Click or tap an available numbered door to view its illustration.
2. Use **Close**, press **Escape**, or click outside the illustration overlay to return to the calendar.
3. The opened door now shows its illustration. Click or tap it to close the door; open it again to
   see the larger view.

From December 1 through 24, one more door becomes available each day. All 24 remain available through
December 31. Outside December, the doors are locked.

Progress is stored in your browser, without an account or sync between devices. Clearing the site's
browser storage removes your saved progress.

---

## For Developers

The calendar uses plain HTML, CSS, and JavaScript modules, with no dependencies or build step.
Serve the project folder with a static server such as VS Code's Live Server.

Open [http://127.0.0.1:5500/](http://127.0.0.1:5500/) in your browser.
On `localhost` and `127.0.0.1`, all 24 doors are available throughout the year for previewing.
Local preview progress uses a separate storage key from the published calendar.

The main files are:

- `index.html`: Calendar layout, door template, and illustration dialog.
- `css/style.css`: Paper background, colors, door sizes, and responsive layout.
- `js/app.js`: Door order, date rules, illustration loading, and saved progress.
- `img/Adventskalender_1.jpg` through `img/Adventskalender_24.jpg`: Daily illustrations.

The calendar runs entirely in the browser and does not require a backend.

---

## License and usage

The code is source-available, not open source. The illustrations are excluded from this license.

You may view and modify the code for personal, educational, and non-commercial purposes.

If you publicly redistribute this project or a modified version of it, you must:

- link to the original project repository
- include a visible attribution to the original project and author, where technically and contextually appropriate
- clearly mark your version as modified and unofficial

Commercial use, paid hosting, resale, and misleading rebranding are not allowed without prior written permission.

See [LICENSE.txt](LICENSE.txt) for the full terms.

### Illustrations

The rights to all illustrations in `img/` remain with their creator. These images are not available
for use, copying, modification, or redistribution, including in personal or non-commercial projects.

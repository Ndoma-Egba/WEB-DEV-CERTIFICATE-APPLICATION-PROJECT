# DOXTracker Citizen Portal

This folder is a standalone React frontend for the DOXTracker certificate application portal. You can open this folder directly in VS Code, edit it, run it, zip it, or move it into another MERN project.

## What Is Inside

- `src/App.jsx` - all React screens and demo logic.
- `src/index.css` - all styling, theme colors, layout, and responsive rules.
- `src/main.jsx` - React startup file that mounts the app.
- `index.html` - browser HTML entry point.
- `vite.config.js` - Vite development server config.
- `docs/PROJECT_STRUCTURE.md` - plain-English guide to the code layout.

## Run It In VS Code

Open this folder in VS Code, then run:

```bash
npm install
npm run dev
```

The app will open at:

```text
http://127.0.0.1:5173
```

## Build It

```bash
npm run build
```

The production build will be created in:

```text
dist/
```

## Where To Edit

Most changes happen in `src/App.jsx`.

Edit the mock application data near the top of the file:

- `APPLICATION_STATS`
- `RECENT_APPLICATIONS`
- `CERTIFICATES`
- `CERTIFICATE_TYPES`

Edit colors, spacing, cards, mobile layout, and fonts in `src/index.css`.

## Backend Connection Notes

Right now this is a clean frontend with demo data. When your backend endpoints are ready, replace the arrays in `src/App.jsx` with API calls, for example:

```js
// Example only:
// const response = await fetch("http://localhost:8000/api/v1/certificates");
// const certificates = await response.json();
```

Good future endpoints for a MERN backend would be:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/certificates`
- `GET /api/certificates/:id/download`

## Notes

This folder intentionally does not include `node_modules`. Install dependencies with `npm install` after moving or opening it in VS Code.

# Project Structure

This guide explains the important files in the DOXTracker frontend.

## `src/main.jsx`

This is the React entry point. It finds the `<div id="root"></div>` element in `index.html` and renders the main `App` component into it.

You rarely need to edit this file unless you add global providers, such as:

- React Router
- Auth context
- Redux or Zustand
- Theme providers

## `src/App.jsx`

This is the main application file. It contains:

- Navigation
- Signup page
- Login page
- Dashboard page
- Application form page
- Certificates page
- Toast notifications
- Reusable small components
- Mock data arrays

The file is heavily commented so it is easy to follow.

### Main Data Sections

`NAV_ITEMS` controls the top navigation buttons.

`APPLICATION_STATS` controls the dashboard count cards.

`RECENT_APPLICATIONS` controls the recent application list.

`CERTIFICATES` controls the certificate cards.

`CERTIFICATE_TYPES` controls the selectable certificate types on the form.

### Main State

`activePage` decides which screen is currently visible.

`selectedCertificateType` stores the chosen certificate type on the form.

`uploadedFile` stores the demo uploaded filename.

`toastMessage` stores short feedback messages.

### Main Functions

`navigate(pageId)` changes the active page.

`showToast(message)` displays temporary feedback.

`simulateUpload()` creates a fake uploaded file preview.

`submitApplication()` shows a fake reference number and returns to dashboard.

## `src/index.css`

This file owns the full design system for the app.

The top `:root` section defines theme variables:

- Brand colors
- Background colors
- Text colors
- Border colors
- Radius values
- Shadow values

The rest of the file is organized by UI area:

- Global reset
- Header and navigation
- Auth pages
- Shared form fields
- Dashboard cards
- Application list
- Application form
- Certificate cards
- Toast
- Mobile responsive rules

If you want to change the visual identity, start with the variables in `:root`.

## `index.html`

This is the base HTML file served by Vite.

The important line is:

```html
<div id="root"></div>
```

React uses that element as the place to render the app.

## `vite.config.js`

This config starts the local development server on:

```text
http://127.0.0.1:5173
```

Change the `port` if another app is already using `5173`.

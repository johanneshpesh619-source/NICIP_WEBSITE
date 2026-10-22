<<<<<<< HEAD
# NICIP_WEBSITE
PNG CIVIL WORKS_ROADS_CONSTRUCTION
=======
# NICIP Construction Ltd Website

A responsive, static website for NICIP Construction Ltd. It presents the company's services, projects, policies, goals, and contact information.

## Project files

- `index.html` — page content and structure
- `style.css` — layout, colors, and responsive styling
- `script.js` — menu behavior, image lightbox, form validation, and other interactions
- `image/` — logo, team, and project photographs

## View the website

No build step or package installation is required. Open `index.html` in a web browser.

For local testing over HTTP, run this from the project folder:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000>.

## Contact form

The contact form submits to the Formspree endpoint configured in `index.html`. Confirm that the endpoint is active and configured to receive messages before publishing the site.

## Publishing

This is a static website and can be hosted by any static web host. Publish `index.html`, `style.css`, `script.js`, and the `image/` directory together, preserving their relative paths.
>>>>>>> 4479e66 (Initial NICIP Website)

# FocusList

> Build. Organize. Simplify.

FocusList is a clean, responsive, frontend-only task manager for organizing daily work without accounts, servers, or external databases. Tasks are stored privately in the browser using `localStorage`.

## Features

- Create tasks with a title, due date, and priority
- Mark tasks as completed with a checkbox
- Edit task details at any time
- Delete tasks permanently
- Search tasks by title
- Filter by all, active, completed, or high-priority tasks
- Track completion progress with a visual progress bar
- Highlight overdue task dates
- Persist tasks across browser reloads
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage` API
- Google Fonts: DM Sans and Space Grotesk

## Project Structure

```text
FocusList/
├── index.html             # Application markup
├── style.css              # Responsive styling and design system
├── script.js              # Task state, rendering, and interactions
├── README.md              # Project documentation
└── FocusList_PRD_TRD.md   # Product and technical requirements
```

## Run Locally

No build tools or dependencies are required.

1. Download or clone the project.
2. Open `index.html` directly in a browser.
3. Start adding tasks.

For a local development server, run this from the project folder if Python is installed:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Data Storage

FocusList stores tasks in the browser under the `focuslist.tasks` localStorage key. No task data is sent to a backend or third-party service.

Clearing browser site data will also remove saved tasks.

## Deployment

Because FocusList is a static website, it can be deployed directly to:

- GitHub Pages
- Vercel
- Netlify

Upload the project files or connect the repository to your preferred hosting provider. No build command is needed.

## License

This project is available for personal and educational use.

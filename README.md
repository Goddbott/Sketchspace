<div align="center">
  <img src="./src/assets/SketchSpace Light Mode.svg" alt="Sketchspace Logo" width="300" />
  <br />
  <p><h3>A real-time, collaborative, infinite whiteboard built for rapid ideation and mathematical exploration.</h3></p>
</div>

<div align="center">

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)

</div>

## 🌐 Live Demo
[Launch Sketchspace](https://sketchspace.example.com) *(Update with actual deployment URL)*

<div align="center">
  <br />
  <img src="./docs/demo.png" alt="Sketchspace Canvas Interface" width="100%" />
</div>

---

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

**Canvas & Drawing**
- **Infinite Whiteboard**: Powered by tldraw for smooth, vector-based drawing.
- **Custom Shapes**: Includes built-in sticky notes, arrows, lines, and custom geometry.
- **Smart Tools**: Auto-stroke straightening, shape recognition, snap-to-grid, and coordinate plane overlays.
- **Styling**: Customizable stroke width, colors, fill patterns, and opacity.

**Real-Time Collaboration**
- **Live Sync**: Sub-millisecond latency synchronization via Yjs and WebSockets.
- **Presence Tracking**: Live multi-user cursors and active participant avatars.
- **Access Controls**: Fine-grained sharing permissions (Viewer, Editor) per canvas.

**Mathematics & Data**
- **Live Equation Editor**: Built-in MathQuill and KaTeX integration for writing and rendering beautiful LaTeX formulas directly on the canvas.
- **Function Graphing**: Integrated Desmos calculator shape for plotting functions interactively.

**Organization & Storage**
- **Anonymous Canvases**: Start drawing instantly without logging in. Anonymous boards are saved locally via IndexedDB and synced to Supabase (auto-expires in 7 days).
- **Dashboard**: Grid/list views for managing your boards.
- **Folder System**: Group related canvases into custom folders.
- **Tagging**: Global search and metadata tagging.
- **Board History**: Integrated timeline modal to scrub through past board states and fork from history.

---

## 🛠 Tech Stack

**Frontend Architecture**
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v7

**Canvas Engine**
- **Core**: Tldraw (`tldraw`)
- **Math Plugins**: `mathquill`, `react-katex`

**Real-Time & Sync**
- **CRDT Implementation**: Yjs (`yjs`)
- **Network Layer**: `y-websocket`
- **Offline Persistence**: `y-indexeddb`

**Backend & Auth**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for canvas thumbnails)

---

## 🏗 Architecture Overview

Sketchspace uses a hybrid architecture designed for speed and offline-capability:

1. **The Canvas Layer**: The UI is handled by `tldraw`, which manages the local document state, rendering, and tool logic.
2. **The Sync Layer**: Changes made in the canvas are captured and piped into a **Yjs CRDT (Conflict-free Replicated Data Type)** document. This ensures that concurrent edits from multiple users never conflict.
3. **The Network Layer**: `y-websocket` pushes CRDT updates to a standalone Node.js WebSocket server, which broadcasts the updates to all connected clients in real-time.
4. **The Persistence Layer**: 
   - *Local*: `y-indexeddb` saves the CRDT state to the user's browser for instant offline access.
   - *Remote*: A debounced sync process saves a snapshot of the canvas (and an SVG thumbnail) to **Supabase**, ensuring the authoritative state is securely backed up and accessible across devices.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase project
- A standalone Yjs WebSocket server (e.g., `npx y-websocket-server`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sketchspace.git
   cd sketchspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your keys (see table below).

4. **Start the local sync server**
   Open a separate terminal window and run a local Yjs WebSocket server:
   ```bash
   npx y-websocket-server --port 5858
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | *Required* |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anon Key | *Required* |
| `VITE_SYNC_SERVER_URL` | The URL of your Yjs WebSocket server | `http://127.0.0.1:5858` |

---

## 📁 Project Structure

```text
src/
├── assets/            # Static assets and branding logos
├── components/        # Reusable UI components (Modals, Buttons, Nav)
├── hooks/             # Custom React hooks (e.g., useYjsStore)
├── lib/               # Third-party integrations (Supabase, API wrappers)
├── pages/             # Route-level components
│   ├── AuthPage.jsx   # Login/Signup logic
│   ├── CanvasPage.jsx # Core Tldraw interface and collaboration
│   ├── Dashboard.jsx  # Canvas management, folders, and tags
│   └── Home.jsx       # Landing page
├── shapes/            # Custom Tldraw shape definitions (Equation, Graph)
├── App.jsx            # Application routing setup
├── index.css          # Global styles, Tailwind directives, and UI overrides
└── main.jsx           # React entry point
```

---

## 🗺 Roadmap

- [x] Initial Canvas Integration
- [x] Real-time Multiplayer (Yjs)
- [x] Math & Graphing Tools
- [x] Anonymous Boards & 7-Day Expiry
- [x] User Authentication
- [x] Dashboard Organization (Folders/Tags)
- [ ] **In Progress**: Board timeline playback/scrubbing improvements
- [ ] **Planned**: PDF Export functionality
- [ ] **Planned**: Custom template library

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

This project wouldn't be possible without these incredible open-source projects:

* [Tldraw](https://tldraw.com/) - The core infinite canvas engine.
* [Yjs](https://yjs.dev/) - CRDT framework for real-time collaboration.
* [Supabase](https://supabase.com/) - Open source Firebase alternative.
* [MathQuill](http://mathquill.com/) & [KaTeX](https://katex.org/) - Beautiful math rendering.
* [Lucide](https://lucide.dev/) - Beautiful, consistent icon set.

---
<div align="center">
  Built with ❤️ by Sketchspace
</div>

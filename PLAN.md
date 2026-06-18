# Anonymous Canvas Implementation Plan

This plan details the implementation of the "Anonymous Canvas" feature based on your specifications. It will transform the app from a single global room into a scalable, unique-URL whiteboard application.

## ⚠️ Important Note
**Yjs Replacement:** This implementation will replace the current real-time `useYjsStore` hook with a robust Local-First architecture using `IndexedDB` and `Supabase` snapshots. (Yjs real-time sync can be seamlessly re-integrated later on top of this architecture).

## Proposed Changes

### [src/pages/Home.jsx]
- Add a component that generates a `uuidv4()` on mount and immediately redirects to `/canvas/:canvasId`.

### [src/App.jsx]
- Update React Router routes:
  - `<Route path="/" element={<Home />} />`
  - `<Route path="/canvas/:canvasId" element={<CanvasPage />} />`

### [src/lib/canvasApi.js]
- Add `fetchCanvasFromSupabase(canvasId)` with expiry checking.
- Add `saveCanvasToSupabase(canvasId, canvasData)` using Supabase upsert logic.

### [src/pages/CanvasPage.jsx]
- Remove `useYjsStore` and transition to a manual Tldraw store.
- Use `useParams` to grab `canvasId`.
- **Mount Logic:** Load snapshot from `idb-keyval`. If missing, fetch from `fetchCanvasFromSupabase()`. Load into `store.loadSnapshot()`.
- **Sync Logic:** Subscribe to Tldraw store changes (`store.listen`). Save instantly to `idb-keyval` and use a `lodash.debounce` wrapper (1500ms) to sync changes to Supabase.
- Add an `ExpiredState` view if the canvas cannot be loaded.

### [src/components/ShareButton.jsx]
- A button that copies `window.location.href` to the clipboard.

### [src/components/SignupBanner.jsx]
- A dismissible banner warning anonymous users that their canvas expires in 7 days without an account.

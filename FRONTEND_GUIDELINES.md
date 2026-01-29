# Frontend Development Guidelines

## 1. Directives for Frontend Efficiency

### Optimistic UI
*   **Goal**: Instant feedback for user actions.
*   **Pattern**: 
    1.  Update the local state *immediately* upon user action (e.g., "Approve Vendor").
    2.  Send the API request in the background.
    3.  If the API call fails, roll back the state change and display an error toast.
    4.  *Do not* wait for the server response to update the UI.

### Smart Caching
*   **Goal**: Minimize Firestore/API reads.
*   **Requirement**: 
    *   Implement "Stale-While-Revalidate" logic for all data fetching hooks.
    *   **Cache Duration**: 5 minutes. Do not re-fetch data fetched < 5 minutes ago unless explicitly invalidated by a user action.
    *   *Recommended Tool*: `swr` or `@tanstack/react-query`.

## 2. Component Hygiene

### Styling (TailwindCSS v4)
*   **Rule**: Avoid `@apply` in CSS files.
*   **Practice**: Keep all styling utility-first directly in the `.tsx` files.
*   **Reasoning**: Allows the Tailwind v4 compiler to effectively tree-shake unused styles and keeps styles colocated with component logic.

## 3. General Architecture
*   **State Management**: Prefer local state or URL state for UI controls. Use Context only for global app state (Auth, Theme).
*   **Types**: Ensure all data interfaces match the Backend/Firestore schema.

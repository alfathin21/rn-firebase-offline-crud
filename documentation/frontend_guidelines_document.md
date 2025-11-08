# Frontend Guideline Document

This document outlines the frontend setup, architecture, and best practices for the `rn-firebase-offline-crud` React Native project. It is intended to give you a clear, step-by-step overview of how things fit together and how to extend the template into a fully offline-first, synchronized application.

## 1. Frontend Architecture

### Overview
- **Framework**: React Native (Expo SDK 52), offering a managed workflow for iOS, Android, and web.
- **Language**: TypeScript, ensuring type safety across models, services, and components.
- **Cloud Backend**: Firebase Authentication for user identity and Firebase Realtime Database or Firestore for real-time cloud data.
- **Local/Offline Layer**: (To be added) e.g., WatermelonDB, Realm, or Expo-SQLite + AsyncStorage.
- **Navigation**: Expo Router for file-based routing.
- **UI Components**: React Native core components, Expo Vector Icons, and a built-in theming system.

### Scalability, Maintainability & Performance
- **Modular structure**: Clear separation into `app/`, `components/`, `db/`, `services/`, `hooks/`, and `models/`.
- **Repository Pattern**: A dedicated `services/` layer (e.g., `PostRepository.ts`, `SyncService.ts`) acts as a single source of truth, abstracting data sources and sync logic.
- **Typed models**: Shared TypeScript interfaces help avoid runtime errors and mismatches between local and remote data.
- **Performance**: Expo’s managed workflow with Hermes engine (when enabled) and React Native optimizations (e.g., FlatList virtualization) keep the app responsive.

## 2. Design Principles

1. **Usability**: Intuitive layouts with clear affordances. File-based routing and reusable components reduce UI inconsistencies.
2. **Accessibility**: Support for screen readers, proper color contrast, focus management, and dynamic font sizing.
3. **Responsiveness**: Flexible layouts using Flexbox, percentage-based sizing, and platform-specific breakpoints when needed.
4. **Visual Consistency**: A global theming system ensures colors, typography, and spacing are uniform across screens.
5. **Feedback & Status**: Clear indicators for loading, syncing, errors, and offline states.

_Application_: Every screen uses `ThemedView` and `ThemedText` components. Buttons and inputs follow a consistent style guide. Color and font sizes adjust automatically for light/dark mode.

## 3. Styling and Theming

### Styling Approach
- **React Native StyleSheet**: Core styles declared via `StyleSheet.create` for performance.
- **CSS-in-JS**: Optional use of `styled-components` or `emotion` for component-scoped theming.
- **Tailwind-style utilities**: Can be layered on top via libraries like `tailwind-rn` if preferred.

### Theming
- **Light & Dark Mode**: Automatic adaptation based on OS settings, driven by a central theme context.
- **Theme Provider**: Wraps the app to supply `colors`, `fonts`, and `spacing` via React Context.

### Visual Style
- **Style**: Modern flat design with subtle elevation shadows for depth. Optionally glassmorphism for overlays (semi-transparent cards).
- **Color Palette**:
  - Primary: `#4A90E2` (blue)
  - Secondary: `#50E3C2` (teal)
  - Accent: `#F5A623` (orange)
  - Background: `#F2F3F5` (light), `#1C1C1E` (dark)
  - Surface: `#FFFFFF` (light), `#2C2C2E` (dark)
  - Text Primary: `#111827` (light), `#F9FAFB` (dark)
  - Error: `#E53935`

- **Typography**:
  - Platform defaults: San Francisco (iOS), Roboto (Android).
  - Scale: 16px base font, 24px headings, 14px captions.

## 4. Component Structure

### Organization
- `app/` – Screen components organized by route (e.g., `app/posts/index.tsx`).
- `components/` – Reusable UI elements (`Button.tsx`, `SyncStatusIndicator.tsx`).
- `hooks/` – Custom hooks encapsulating logic (`usePosts.ts`, `useSyncStatus.ts`).
- `db/` – Local database setup, schemas, and migrations (e.g., WatermelonDB models).
- `services/` – Repository and sync services handling data operations.
- `models/` – TypeScript interfaces for domain objects (`Post`, `User`).

### Benefits of Component-Based Architecture
- **Reusability**: Build once, reuse everywhere (buttons, form fields, cards).
- **Testability**: Isolated components are easier to unit test.
- **Maintainability**: Clear ownership; UI changes rarely impact data logic.

## 5. State Management

### Current Approach
- **React Hooks**: useState, useEffect, useContext for local component state.

### Recommended Evolution
- **React Query (TanStack Query)**:
  - Caching of server and local data.
  - Background refetching and retry logic.
  - Built-in support for optimistic updates, ideal for offline UX.

### Flow
1. UI calls `usePosts()` hook.
2. Hook delegates to `PostRepository`.
3. Repository reads from local DB or queue, and triggers background sync.
4. State updates propagate back to UI automatically.

## 6. Routing and Navigation

### Library
- **Expo Router**: File-based routing maps folders to screens.

### Structure
- `app/(tabs)/` – Tab navigator screens (e.g., Home, Create).
- `app/posts/index.tsx` – List of posts.
- `app/posts/[id].tsx` – Post detail.
- `app/posts/create.tsx` – Create/edit post form.

### Navigation Patterns
- **Stack & Tab**: Combine tab navigation for main sections with stack navigation for detail views.
- **Deep Linking**: Enabled via Expo Router’s config in `app.json`.

## 7. Performance Optimization

- **Lazy Loading**: Dynamically import heavy screens or components when needed.
- **Code Splitting**: Leverage Expo’s Metro bundler to split code into logical chunks.
- **Image & Asset Optimization**: Use `expo-image` with caching and appropriate resizing.
- **List Virtualization**: Use `FlatList` or `SectionList` with `getItemLayout`, `initialNumToRender`.
- **Memoization**: Wrap pure components with `React.memo`; use `useMemo` and `useCallback` to prevent unnecessary renders.
- **Hermes Engine**: Enable Hermes in `app.json` for faster startup and lower memory usage.

## 8. Testing and Quality Assurance

### Unit Tests
- **Jest**: Core test runner.
- **React Native Testing Library**: Render components and assert on UI.
- **Mocking**: `@react-native-firebase/testing` for Firebase mocks.

### Integration Tests
- Test custom hooks (`usePosts`, `useSyncStatus`) against a mocked repository layer.

### End-to-End Tests
- **Detox**: Automate user flows on real or simulated devices.

### Linting & Formatting
- **ESLint** with React Native and TypeScript rules.
- **Prettier** for consistent code style.
- **Husky & lint-staged** to run linters on pre-commit.

## 9. Conclusion and Overall Frontend Summary

This guideline documents how the `rn-firebase-offline-crud` project leverages React Native, Expo, and Firebase to provide a robust online foundation. By layering in a local database (e.g., WatermelonDB) and a repository + sync service, you can achieve a seamless offline-first experience with cloud synchronization.

Key takeaways:
- A modular folder structure and typed models promote maintainability.
- Theming, reusable components, and design principles ensure a polished UX.
- React Query, lazy loading, and Hermes support a performant, resilient app.
- A comprehensive testing strategy guarantees reliability as complexity grows.

With these guidelines, you have a clear roadmap to transform this boilerplate into a production-ready, offline-capable mobile application.
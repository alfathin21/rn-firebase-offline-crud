# Project Requirements Document (PRD)

## 1. Project Overview

This project is an offline-first mobile application built with React Native and the Expo managed workflow, backed by Firebase for real-time cloud synchronization. It starts with a fully configured online foundation—user authentication, data storage in Firestore, theming, and file-based routing—and adds a local database and sync logic to allow users to perform full Create, Read, Update, Delete (CRUD) operations even when they have no network connection.

We’re building this to give developers a robust starter kit that solves the core problem of data availability and consistency across online and offline modes. Key objectives include:
- Seamless offline data persistence so that users can view and modify records without network access.
- Automatic two-way sync between the local database and Firebase when a connection is available.
- Clear user feedback on sync status, conflict resolution, and error handling.

Success will be measured by fast local load times, reliable synchronization in real-world network conditions, and a clean, reusable code structure that developers can extend without friction.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- Firebase Authentication: Sign up, login, logout, and password reset.
- Cloud Database: Real-time reads and writes to Firestore (or Realtime Database).
- Local Database Integration: Set up a local data store (e.g., WatermelonDB) for offline CRUD.
- Synchronization Service: Background two-way sync between local DB and Firebase, with optimistic updates and conflict handling.
- UI Screens: List view, detail view, and create/edit form for a single data type (e.g., `Post`).
- Sync Status Indicators: Visual badges or banners showing "synced", "pending", and "offline" states.
- Theming & Navigation: Light/dark mode support and file-based routing with Expo Router.
- Repository Layer: Single source of truth for data operations, isolating UI from storage logic.

### Out-of-Scope (This Phase)
- Support for multiple data models beyond a single CRUD entity.
- Advanced conflict resolution strategies (e.g., manual merge dialogs).
- Push notifications or real-time collaboration features.
- Analytics, A/B testing, or advanced telemetry.
- Web-specific optimizations beyond Expo web support.
- Native code customizations outside the Expo managed workflow.

## 3. User Flow

When a new user opens the app for the first time, they’re presented with a login screen powered by Firebase Authentication. After entering credentials or signing up, they land on a main dashboard, which is a tabbed interface showing a list of items (e.g., posts). The list is populated immediately from the local database, ensuring a fast, responsive experience. A top-level banner indicates whether the app is online or offline.

From the list, the user can tap a "New" button to open a create form, fill in the details, and save. The app writes this record directly to the local database and shows it in the list instantly (optimistic UI). In the background, a sync service pushes the change to Firebase and updates its sync status. Tapping an existing item opens the detail and edit screen, where the user can modify or delete the record. All changes work offline and sync transparently when a connection returns.

## 4. Core Features

- **Authentication Module**  
  Sign up, login, logout, and password reset using Firebase Authentication SDK, plus secure token management.

- **Local Database Integration**  
  Choose and configure WatermelonDB (or Realm/SQLite) for storing records locally with schema definitions and migrations.

- **Cloud Sync Service**  
  Background task (using `expo-task-manager`) that detects connectivity changes, pulls remote updates, and pushes local mutations.

- **Repository Layer**  
  A TypeScript class (e.g., `PostRepository`) that exposes `create`, `read`, `update`, and `delete` methods, abstracts local vs. remote logic, and queues sync tasks.

- **CRUD Screens**  
  File-based routing under `app/`: 
  - `index.tsx` (list view)
  - `[id].tsx` (detail/edit view)
  - `create.tsx` (new item form)

- **Sync Status Indicators**  
  UI components to display global connection status, item-level sync badges (pending, syncing, synced).

- **Theming System**  
  Light/dark mode support with reusable themed components (`ThemedView`, `ThemedText`).

- **State Management**  
  React Query (TanStack Query) for caching, background refetching, optimistic updates, and error handling.

## 5. Tech Stack & Tools

- **Frontend**: React Native (Expo SDK 52), TypeScript, Expo Router (file-based navigation).
- **Cloud Services**: Firebase Authentication, Firestore (or Realtime Database), Firebase Security Rules.
- **Local Database**: WatermelonDB (recommended), or Realm / Expo-SQLite + AsyncStorage.
- **State & Data Fetching**: React Query for client-side caching and sync orchestration.
- **Background Tasks**: `expo-task-manager` + `expo-background-fetch` for offline sync.
- **UI**: React Native components, Expo Vector Icons.
- **IDE & Plugins**: VS Code with TypeScript/ESLint, optional Cursor or Windsurf AI code assistance.

## 6. Non-Functional Requirements

- Performance: <100ms local DB query response; background sync should not block UI.
- Security: All API calls over HTTPS; Firebase Security Rules enforce per-user data isolation.
- Data Integrity: Transactional writes in local DB; conflict detection and basic resolution.
- Usability: Offline/online status clearly displayed; forms validate input; accessible color contrasts for light/dark modes.
- Reliability: Retry with exponential backoff for failed sync operations.
- Compliance: GDPR-friendly data handling; users can delete their data.

## 7. Constraints & Assumptions

- The app uses Expo managed workflow; no custom native modules outside Expo.
- Firebase project must support Firestore (or Realtime Database) and Authentication.
- WatermelonDB (or chosen local DB) is compatible with Expo and React Native.
- Background tasks on iOS may be paused if the app is terminated; assume best-effort sync.
- Users will intermittently connect to the internet; perfect connectivity cannot be guaranteed.

## 8. Known Issues & Potential Pitfalls

- **Conflict Resolution**: Simple last-write-wins may lead to data loss. Mitigation: Detect conflicts, flag items for manual review, or use versioned records.
- **API Rate Limits**: Firestore has quota limits. Mitigation: Batch writes and use React Query to dedupe fetches.
- **Local DB Migrations**: Schema changes can cause data loss if not handled carefully. Mitigation: Write and test migrations in the `db/` folder.
- **Background Sync Limitations**: iOS aggressively suspends background tasks. Mitigation: Encourage users to open the app periodically or implement manual sync trigger.
- **Large Attachments**: If you store photos or files, syncing them can be slow. Mitigation: Use Firebase Storage with separate sync logic and show upload progress.

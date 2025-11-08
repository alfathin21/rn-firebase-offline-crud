# Backend Structure Document

## 1. Backend Architecture

Our backend is built on Firebase’s serverless platform, offering a ready-to-use suite of managed services. Everything from user identity to data storage lives in the cloud, so there are no physical servers to maintain.

Key design choices:

- **Serverless, event-driven model:** We rely on Firebase services (Authentication, Firestore, optional Cloud Functions) rather than traditional application servers.
- **Managed services:** Google Cloud handles auto-scaling, uptime, and patching, so we stay focused on features, not infrastructure.
- **Client-driven data flow:** The React Native app interacts directly with Firebase via the SDK. No custom REST or GraphQL server is required, simplifying maintenance.

How this supports our goals:

- **Scalability:** Firestore and Authentication scale seamlessly as user count or data volume grows.
- **Maintainability:** Using Firebase’s console and managed rules keeps configuration in one place and minimizes operational overhead.
- **Performance:** Serverless endpoints and globally distributed data centers reduce latency for end users.

## 2. Database Management

### Technologies Used
- **Cloud Firestore (NoSQL):** Our primary cloud database, organized into collections and documents.
- **Local Cache (Expo-SQLite or WatermelonDB):** To be added for offline support.

How data is handled:

- **Data structure:** Records (e.g., posts, profiles) live as documents in named collections (e.g., “posts”, “users”). Each document holds fields like text, timestamps, and references to other documents.
- **Read/write:** The app uses the Firebase SDK to read documents in real time or batch, and to write or update data instantly when online.
- **Offline persistence:** Firestore offers built-in caching so recently accessed data is still available when the network is down. For full offline CRUD, we layer in a local database in the app.
- **Data validation & rules:** Firestore Security Rules enforce who can read or write each document, helping us maintain data integrity.

## 3. Database Schema (NoSQL)

Below is a human-friendly outline of our Firestore collections and key fields. Each entry represents one document type.

• **users**
  - `id` (string): Unique user ID from Firebase Authentication
  - `email` (string)
  - `displayName` (string)
  - `createdAt` (timestamp)
  - `photoURL` (string, optional)

• **posts**
  - `id` (string): Auto-generated document ID
  - `userId` (string): Reference to `users/{id}`
  - `title` (string)
  - `content` (string)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
  - `status` (string): e.g., “pending”, “synced” for offline tracking

• **comments** (optional)
  - `id` (string)
  - `postId` (string): Reference to `posts/{id}`
  - `userId` (string)
  - `text` (string)
  - `createdAt` (timestamp)

• **syncQueue** (local-only)
  - `operation` (string): “create” | “update” | “delete”
  - `collection` (string)
  - `documentId` (string)
  - `data` (object): Payload to sync
  - `retryCount` (number)
  - `status` (string): “queued” | “in-progress” | “failed”

## 4. API Design and Endpoints

We do not run a separate server API. Instead, the app talks directly to Firebase using its SDK:

- **Authentication calls:**
  • `createUserWithEmailAndPassword(email, password)`
  • `signInWithEmailAndPassword(email, password)`
  • `signOut()`

- **Firestore operations:**
  • `onSnapshot(collectionRef)` – Listen for real-time updates
  • `getDocs(collectionRef)` – Fetch batch data
  • `addDoc(collectionRef, data)` – Create new record
  • `updateDoc(docRef, data)` – Update existing record
  • `deleteDoc(docRef)` – Remove a record

These methods serve as our “endpoints.” The React Native app invokes them directly and responds to success or failure events.

## 5. Hosting Solutions

All backend services run on **Google Cloud via Firebase**, which includes:

- **Firebase Authentication:** Hosted and managed by Google.
- **Cloud Firestore:** Fully managed NoSQL database.
- **(Optional) Firebase Hosting:** If you add a web component, static files can be served worldwide via a CDN.

Benefits:
- **Reliability:** 99.9% SLA for critical services.
- **Auto-scaling:** Automatic resource provisioning as load increases.
- **Cost-effectiveness:** Pay only for actual usage (reads/writes/storage).

## 6. Infrastructure Components

While there are no traditional servers, Firebase and Google Cloud provide these components:

- **Global CDN:** Used by Firebase Hosting to deliver static assets quickly.
- **Load balancing:** Built into Firestore’s managed service to evenly distribute read/write requests.
- **Local caching:** Firestore SDK caches data on the device; for full offline, we add a local database layer (e.g., WatermelonDB).
- **Background tasks:** Expo Task Manager (or similar) can run sync jobs even when the app is in the background.

Together, these pieces ensure fast data access, smooth UI responsiveness, and reliable delivery of both static and dynamic content.

## 7. Security Measures

We follow best practices to protect user data and comply with regulations:

- **Authentication & Authorization:**
  • Firebase Authentication manages user sign-in and issues secure tokens.
  • Firestore Security Rules grant or deny read/write access based on user roles and document ownership.

- **Data encryption:**
  • All traffic between the app and Firebase is encrypted in transit (TLS/HTTPS).
  • Firestore automatically encrypts data at rest with Google-managed keys.

- **Validation & rules:**
  • Firestore Rules validate incoming data shapes and enforce limits (e.g., field lengths).
  • Role-based access can be added to separate normal users from admins.

## 8. Monitoring and Maintenance

We use Firebase and Google Cloud tools to keep an eye on system health:

- **Firebase Console:** Built-in dashboards for Authentication and Firestore usage, errors, and quota monitoring.
- **Cloud Logging & Monitoring (Stackdriver):** Detailed logs and custom alerts on error rates or latency spikes.
- **Performance Monitoring:** Firebase Performance helps track slow network calls and UI traces.
- **Crashlytics:** Captures app crashes and non-fatal errors on devices.

Maintenance strategy:
- **Monthly review:** Check usage costs, rule audits, and performance metrics.
- **Rule updates:** Version control for Firestore Rules to adapt to new data models.
- **Dependency updates:** Keep Firebase SDK and Expo dependencies up to date to receive security patches.

## 9. Conclusion and Overall Backend Summary

In summary, our backend is a fully serverless, managed environment powered by Firebase on Google Cloud. It delivers:

- **Fast development:** No servers to provision; use SDKs for auth and data.
- **Robust security:** Built-in authentication, encrypted traffic, and fine-grained access rules.
- **Seamless scalability:** Automatic handling of growth in users and data.
- **Offline readiness:** With local caching and a planned local database, users can work without network interruptions.

This setup aligns perfectly with our goals of a reliable, performant, and maintainable backend for an offline-first React Native app that synchronizes data with the cloud.
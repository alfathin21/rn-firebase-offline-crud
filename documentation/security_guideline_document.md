# Security Guidelines for rn-firebase-offline-crud

This document provides security-by-design guidance tailored to the **rn-firebase-offline-crud** React Native starter template. It covers best practices and controls you should integrate while extending this boilerplate into a robust, offline-first mobile application with Firebase synchronization.

## 1. Security-by-Design Principles

- **Least Privilege:** Grant only necessary permissions (both in app code and Firebase rules). Avoid over-permissive configuration.
- **Defense in Depth:** Layer controls—encrypt data at rest and in transit, enforce client‐ and server‐side validation, apply mobile‐platform security, and secure CI/CD pipelines.
- **Fail Securely:** On errors or connectivity issues, do not leak sensitive details. Show generic messages and log securely.
- **Secure Defaults:** Out of the box, configure minimal privileges, require authentication on every operation, and disable debug features in production.

## 2. Authentication & Access Control

- Use **Firebase Authentication** with email/password or OAuth providers. Enforce strong password policies and MFA for sensitive accounts.
- Store only JWTs or Firebase tokens in secure storage (Keychain on iOS, EncryptedSharedPreferences/Keystore on Android). Do **not** use plain `AsyncStorage`.
- Validate authentication on every request. On the server side (Firebase Security Rules), enforce that:
  - Read/write operations require `request.auth != null`.
  - Users can only access their own data (e.g., `request.auth.uid == resource.data.ownerId`).
- Implement Role‐Based Access Control (RBAC) if multiple user roles are needed. Encode roles in custom claims and enforce them in rules.
- Rotate API keys or service account credentials via Firebase console/sync tool. Revoke compromised tokens immediately.

## 3. Secure Data Transmission & Storage

### 3.1 Transport Layer Security (TLS)
- Enforce HTTPS/TLS 1.2+ for all Firebase and custom API communications.
- Implement **certificate pinning** (e.g., via `react-native-pinch`) to prevent man-in-the-middle attacks.

### 3.2 Encryption at Rest
- **Local Database (Offline):** Use an encrypted database solution:
  - WatermelonDB with SQLCipher
  - Realm with encryption key
  - `expo-secure-store` or `react-native-encrypted-storage` for small secrets
- **Key Management:** Generate encryption keys at runtime and store them in the secure enclave (iOS Keychain / Android Keystore).
- **Firebase Data:** Rely on Google-managed encryption at rest. Do not store PII in plain text in local logs.

## 4. Offline Data Security & Sync Integrity

- **Queueing & Persistence:** Store pending operations in the encrypted local DB. Only remove them upon successful server acknowledgment.
- **Conflict Resolution:** Define a deterministic conflict‐resolution strategy (e.g., last‐write‐wins or merge logic) and enforce it both in the client sync service and Firebase Security Rules.
- **Integrity Checks:** For each queued operation, compute an HMAC or digital signature to detect tampering before push.
- **Network Monitoring:** Detect connectivity changes securely. On offline, disable operations that require server trust. On reconnect, authenticate again and verify token validity.

## 5. Input Handling & Output Encoding

- **Client‐Side Validation:** Validate form inputs (length, type, format) before writing to local DB.
- **Server‐Side Validation:** Re-validate all inputs against schemas in Firebase Cloud Functions or Firestore rules to prevent injection or corrupt data.
- **XSS & Injection:** Although React Native UIs are not typical HTML, sanitize any HTML or markdown rendered via WebView or third-party components.
- **File Uploads:** If you allow image/video uploads to Firebase Storage:
  - Restrict allowed MIME types and size limits.
  - Enforce directory isolation and unique naming.
  - Scan uploads for malware via Cloud Functions.  

## 6. Firebase & API Security

- **Firestore/Realtime Database Rules:** 
  - Write granular rules per collection/path.
  - Use `validate` expressions to enforce data schemas (e.g., field types, string lengths).
- **Cloud Functions:**
  - Enforce IAM least-privilege for each function.
  - Validate and sanitize inputs.
  - Reject unauthorized or malformed requests explicitly.
- **Rate Limiting & Throttling:** 
  - Implement usage quotas per user (via Cloud Functions checks).
  - Detect and block brute-force login attempts.

## 7. Mobile Application Security Hardening

- **Secure Storage:** 
  - Never store secrets or tokens in plain `AsyncStorage`.
  - Use platform‐specific secure storage APIs.
- **App Transport Security (iOS):** Ensure ATS is enabled and only allows trusted origins.
- **Android Network Security Config:** Define a network security config XML to enforce certificate validation and restrict cleartext.
- **Obfuscation & Minification:** Enable ProGuard (Android) and dead-code removal to increase difficulty of reverse engineering.
- **Code Signing & Integrity:** Use expo’s over-the-air (OTA) update signing or App Store / Play Store signing with strong certificates.
- **Debug & Logging:** Disable debug menus, dev flags, and verbose logs in production builds. Mask or drop PII in logs.

## 8. Secrets & Configuration Management

- **Environment Variables:** Store Firebase credentials, API keys, and encryption secrets in environment files (`.env`) excluded from version control.
- **CI/CD Secrets:** Use your CI system’s secret store (e.g., GitHub Actions Secrets, CircleCI Contexts).
- **Rotation & Revocation:** Rotate keys regularly. Have rollback procedures in place for compromised credentials.

## 9. CI/CD & Infrastructure Security

- **Static Analysis & SAST:** Integrate tools like ESLint (with security plugins), SonarQube, or CodeQL to scan for vulnerabilities.
- **Dependency Scanning:** Use Dependabot, Snyk, or npm audit to detect vulnerable packages and enforce lockfiles (`package-lock.json`).
- **Automated Testing:** Include unit and integration tests for repository logic, sync service, and Cloud Functions with negative/edge‐case scenarios.
- **Least-Privilege IAM:** Service accounts used in build pipelines should only have permissions needed for build and deploy steps.

## 10. Dependency & Third-Party Risk Management

- **Vet Libraries:** Choose maintained, widely used packages. Avoid abandoned or untrusted modules.
- **Minimal Footprint:** Only install required dependencies. Regularly prune transitive dependencies.
- **Version Pinning:** Lock to specific versions. Test updates in staging before production rollout.

## 11. Monitoring, Logging & Incident Response

- **Client-Side Monitoring:** Integrate Sentry or Firebase Crashlytics to capture crashes and exceptions. Exclude PII.
- **Server-Side Logs:** Route Cloud Function logs to Cloud Logging. Set up alerts on error rates or suspicious access patterns.
- **Incident Playbook:** Define procedures for detecting, responding to, and recovering from security incidents (data breaches, compromised keys).

---

Adhering to these guidelines will ensure the **rn-firebase-offline-crud** starter template evolves into a secure, offline-first application, resilient against common mobile and cloud-based threats. Continuous review, testing, and monitoring are essential as the codebase and threat landscape evolve.
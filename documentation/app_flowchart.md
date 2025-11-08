flowchart TD
    A[App Launch] --> B{Is User Authenticated}
    B -->|Yes| C[Load Main Tabs]
    B -->|No| D[Show Auth Screen]
    C --> E[Fetch Data from Local DB]
    E --> F[Display Item List]
    F --> G{User Action}
    G -->|Create| H[Open Create Form]
    G -->|View| I[Open Detail View]
    G -->|Refresh| R[Manual Sync]
    H --> J[Save to Local DB]
    J --> K[Mark Record as Pending Sync]
    K --> L[Background Sync Service]
    L --> M[Push Local Changes to Firebase]
    L --> N[Fetch Remote Changes]
    N --> O[Update Local DB]
    O --> P[Refresh UI]
    L --> Q[Update Sync Status]
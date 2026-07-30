# Layos LMS Dashboard - Frontend Architectural Document

This document serves as a detailed reference guide for the **Layos LMS Dashboard** (located in the [frontend](file:///c:/laragon/www/layosgroup/frontend) folder). It describes the directory layout, design choices, authentication flows, roles, real-time sync systems, interactive media handling, and specific API mappings. Additionally, a portability guide is included to outline translation points for developing a mobile app equivalent (e.g., in React Native, Flutter, or Swift/Kotlin).

---

## 1. Overview & Tech Stack

The dashboard is designed as a **React Single-Page Application (SPA)** utilizing the following core technologies:

- **Core Framework**: React 19 (managed via Vite)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 (with custom theme tokens in `student.css` and `App.css`)
- **State Management**: React Context (`AuthContext` with browser local storage persistent states)
- **HTTP Client**: Axios & Fetch API (requests dynamically routing through an API base url)
- **Real-Time Features**: Laravel Echo & Pusher JS (integrated with Laravel Reverb WebSockets)
- **AI Integrations**: Puter.js AI SDK (`@heyputer/puter.js`) and Azure AI Proxy (via GitHub Token)
- **Specialized Media Utilities**: React Konva (for certificate template designer), PDF.js (`pdfjs-dist`), and JSZip (for parsing PowerPoint slides)

---

## 2. Directory Structure Map

```
frontend/
├── api/
│   └── chat.ts                  # Serverless endpoint proxy for Azure AI completions
├── public/                      # Static assets (images, pre-loaders, icons)
├── src/
│   ├── assets/                  # CSS stylesheets, logos, and page backgrounds
│   ├── components/              # Shared and domain-specific UI components
│   │   ├── auth/                # Modal dialogs for 2FA setup & confirmations
│   │   ├── channel/             # Core messaging interface components
│   │   ├── common/              # Preloaders and skeleton screens
│   │   ├── layouts/             # Master wraps (InstructorLayout, AdminLayout)
│   │   ├── payment/             # Access locks and balance warnings
│   │   └── student/             # Secure PDF render frames, PDF AI interactions, TTS panels
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth token storage, user properties, and 2FA toggles
│   ├── hooks/
│   │   └── useTheme.ts          # Dark/Light theme toggles
│   ├── pages/                   # Main page layout views split by authorization role
│   │   ├── admin/               # Administrative controls (Dashboard)
│   │   ├── auth/                # Student & Instructor registration, login, and pass reset
│   │   ├── instructor/          # Cohorts, curriculum builder, student list, assignments, review
│   │   │   ├── assignments/
│   │   │   ├── interviews/
│   │   │   └── layout/
│   │   ├── student/             # Student dashboard, courses player, assignments, DMs, live class
│   │   │   ├── account/
│   │   │   ├── assignments/
│   │   │   ├── courses/
│   │   │   ├── interviews/
│   │   │   ├── layout/
│   │   │   └── live/
│   │   ├── CertificateVerification.tsx # Public route for scanned certificate QR-code verification
│   │   ├── CheckoutSuccess.tsx  # Redirection handler for Stripe purchases
│   │   └── NotFound.tsx         # Fallback 404 handler
│   ├── utils/
│   │   ├── echo.ts              # Real-time WebSocket connection engine (Laravel Reverb)
│   │   ├── paymentUtils.ts      # Enforcer calculations (Tuition countdown, installment warning states)
│   │   ├── pdfTextExtractor.ts  # Client-side text parsing for PDFs and PPTX files
│   │   ├── puterAI.ts           # Puter SDK wrappers for summarization, voice gen, tutor chat
│   │   └── useAIPutter.ts       # Hook driving the interactive AI tutor stream
│   │   └── usePdfTts.ts         # Hook driving the Text-To-Speech reader controls
│   ├── App.tsx                  # Root Routing Registry
│   ├── main.tsx                 # Bootstrapper
│   └── vite-env.d.ts            # Environment typing
├── dev-server.js                # Local API runner using Express for hot TypeScript endpoint execution
├── package.json                 # Project dependencies & build automation configurations
└── tsconfig.json                # TypeScript compilation properties
```

---

## 3. Core Architectural Modules

### 3.1. Authentication, Sessions & Guarded Routing

Guarded routing utilizes [ProtectedRoute.tsx](file:///c:/laragon/www/layosgroup/frontend/src/components/ProtectedRoute.tsx) to validate session states prior to loading pages:

1. **Tokens**: Successful logins store a JWT bearer token under `localStorage.getItem('token')`.
2. **Context Provider**: [AuthContext.tsx](file:///c:/laragon/www/layosgroup/frontend/src/context/AuthContext.tsx) maintains reactive user object hooks and keeps track of roles (`student`, `instructor`, `admin`).
3. **Session Checkpoints**: If `isAuthenticated` evaluates to `false`, access is redirected immediately to `/login`. If role scopes mismatch, pages route students to `/student-dashboard` and instructors to `/instructor-dashboard`.
4. **2FA Gate**: Users setting up Two-Factor Authentication have their login request routed to `/2fa/verify-login`. Code distribution is processed via email or SMS using the backend API.
5. **Active Device Management**: Sessions query `/active-sessions` allowing users to inspect browser properties, locations, and remotely terminate secondary sessions.

---

### 3.2. Student Tuition Enforcement System

One of the critical rules built into the student portal dashboard is **tuition tracking lockouts**:

- **Core Formula (`getPaymentInfo` in [paymentUtils.ts](file:///c:/laragon/www/layosgroup/frontend/src/utils/paymentUtils.ts))**:
  Students enrolled in a cohort on installment arrangements (50% payment plan) get a fixed duration window starting from the cohort start date:
  - Foundation Courses: **7 days**
  - Professional Courses: **14 days**
  - Bundle Courses: **21 days**
  
- **Visual Alert Thresholds**:
  - `yellow`: More than 96 hours left.
  - `orange`: Between 48 and 96 hours left.
  - `red`: Less than 48 hours left (indicates urgent tuition balance payment required).
  - `expired`: Lockout triggered.
  
- **Access Enforcement**:
  Components wrapping video players, lesson contents, or quiz views execute a wrap check against `paymentInfo.isExpired`. If true, they mount the [AccessRevokedOverlay.tsx](file:///c:/laragon/www/layosgroup/frontend/src/components/payment/AccessRevokedOverlay.tsx), which locks the interface and prompts the user to clear the remaining balance using standard Stripe Checkout (`/stripe/create-balance-checkout-session`).

---

### 3.3. Secure PDF & PowerPoint Document Viewer

To prevent direct download, copying, or hotlink sharing of intellectual training property, files are protected inside [SecurePDFViewer.tsx](file:///c:/laragon/www/layosgroup/frontend/src/components/student/SecurePDFViewer.tsx):

1. **Proxy URL Router**: Remote assets do not stream directly. Instead, `buildProxyUrl()` wraps the remote document target, parsing it through the backend server route `/api/pdf-proxy?url=...`.
2. **CORS & S3 Bypass**: The proxy resolver bypasses CORS policies and resolves expired S3 pre-signed URLs by generating signatures server-side.
3. **Copy Restrictions**: Text-selection layers and annotation contexts are explicitly disabled within `react-pdf` (`renderTextLayer={false}`, `renderAnnotationLayer={false}`), and standard browser select commands are blocked with visual overlays.
4. **Offline Extractors**: Client-side extraction ([pdfTextExtractor.ts](file:///c:/laragon/www/layosgroup/frontend/src/utils/pdfTextExtractor.ts)) reads underlying slides or page nodes strictly inside JS memory loops for AI compilation, keeping file buffers secure in the sandboxed local scope.

---

### 3.4. Interactive AI Virtual Tutor & Text-To-Speech

The Virtual Tutor features two main components:

- **AI Tutor Interface (`AIPDFInteraction.tsx` & `useAIPutter.ts`)**:
  - Extracts the PDF text in 2,000-character segments.
  - Calls `gpt-4o-mini` via `/api/chat` to synthesize teaching notes.
  - Offers a conversational pane allowing students to query the virtual tutor about document concepts.
  
- **Text-To-Speech (`usePdfTts.ts`)**:
  - Leverages the browser HTML5 **Web Speech API** (`window.speechSynthesis`).
  - Supports pause, rate modifications, voice selection, tracking sentence-level chunks, and highlighting progress dynamically as narration completes.

---

### 3.5. Audio-Only Lesson Visualization

For lesson units containing only audio tracks packaged as video containers:

- **Track Detection**: `useVideoTrackDetector` evaluates `videoWidth` and `videoHeight` once loaded metadata registers. If width/height is zero but audio data is present, the interface dynamically updates the layout.
- **Audio Visualizer**: The browser's `AudioContext` connects to `createMediaElementSource(video)`. An analyzer node tracks real-time frequency data, rendering animated equalizer bars onto a HTML5 Canvas matching the brand's primary color schemes.

---

### 3.6. Real-Time Chat & Communications

Real-time message routing is handled by **Laravel Reverb** through the [echo.ts](file:///c:/laragon/www/layosgroup/frontend/src/utils/echo.ts) socket bootstrap. Real-time updates connect to specific channel mappings:

#### Course-Specific Channels
- **Subscription Route**: `course-channel.{channelId}` (Public/Private depending on group scopes)
- **Events Listened**:
  - `.message.created`: Dispatched on new messages or comment replies.
  - `.message.deleted`: Notifies clients to remove specified elements from the conversation layout or replace content with "deleted".

#### Direct Messaging (DM)
- **Subscription Route**: `private-user.{userId}` (Requires sanctum socket token authorization via `/api/broadcasting/auth`)
- **Events Listened**:
  - `.dm.created`: Delivers direct text contents and attachments to the user.
  - `.dm.deleted`: Deletes matching indices dynamically from database records.

---

### 3.7. Instructor Workspace Modules

- **Cohort & Curriculum Managers**:
  - Instructors construct course structures, assemble lesson steps, bind videos, and arrange modules in [CurriculumBuilder.tsx](file:///c:/laragon/www/layosgroup/frontend/src/pages/instructor/CurriculumBuilder.tsx).
  - Assign students, edit progress details, or track registration timelines.
  
- **Interactive Certificate Template Builder**:
  - Located in [CertificateTemplateManager.tsx](file:///c:/laragon/www/layosgroup/frontend/src/pages/instructor/CertificateTemplateManager.tsx).
  - Uses **React Konva** to present a visual template designer.
  - Enables instructors to drop merge fields (e.g., student name, course title, issue date, credential ID) and visually position coordinates on the certificate template canvas.

---

## 4. API Endpoints Map

This list documents the primary API endpoints mapped from the Laravel backend (`routes/api.php`):

| HTTP Method | Route | Description | Auth Mode |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Student authenticates using credentials. | Public |
| **POST** | `/api/instructor/login` | Instructor authenticates. | Public |
| **POST** | `/api/2fa/verify-login` | Submits MFA codes to authorize log sessions. | Public |
| **POST** | `/api/register` | Signs up new student accounts. | Public |
| **POST** | `/api/forgot-password` | Initiates password reset requests. | Public |
| **GET** | `/api/pdf-proxy` | Streams external PDF files bypassing CORS / S3 expirations. | Public |
| **GET** | `/api/user` | Fetches active user profiles with assigned cohorts/lessons. | Bearer Token |
| **GET** | `/api/my-enrollments` | Retrieves user's registered cohorts, dates, and payments. | Bearer Token |
| **GET** | `/api/certificates` | Lists claimed and claimable student certificates. | Bearer Token |
| **POST** | `/api/certificates/claim/{courseId}`| Initiates student certificate claims. | Bearer Token |
| **POST** | `/api/stripe/create-balance-checkout-session` | Initiates payment for remaining tuition balance. | Bearer Token |
| **GET** | `/api/student/live-sessions` | Displays upcoming live video streams for students. | Bearer Token |
| **GET** | `/api/student/assignments` | Lists student assignments. | Bearer Token |
| **POST** | `/api/student/assignments/{id}/submit` | Uploads student assignment files. | Bearer Token |
| **GET** | `/api/direct-messages/contacts` | Fetches direct message threads. | Bearer Token |
| **GET** | `/api/direct-messages/{userId}`| Retrieves DM conversation history. | Bearer Token |
| **POST** | `/api/direct-messages/{userId}`| Sends a new DM message. | Bearer Token |
| **GET** | `/api/instructor/dashboard-stats` | Generates metrics for instructor dashboards. | Bearer Token |
| **POST** | `/api/courses` | Adds courses to the catalog (Instructor). | Bearer Token |
| **PUT** | `/api/courses/{course}` | Modifies course assets/details. | Bearer Token |
| **POST** | `/api/upload-video` | Uploads video assets to storage. | Bearer Token |

---

## 5. Mobile Portability & Implementation Blueprint

If you are developing a native or cross-platform mobile application (React Native, Flutter, Swift, or Kotlin), follow these recommendations to translate features from the React SPA:

### 5.1. Session Storage & Secure Storage
* **Web Equivalent**: `localStorage` (stores tokens, user profile configs).
* **Mobile Translation**:
  * Avoid raw AsyncStorage/SharedPreferences for access tokens.
  * **React Native**: Use `react-native-keychain` or `expo-secure-store` to keep JWT tokens safe.
  * **Flutter**: Use `flutter_secure_storage`.
  * **Native**: Use iOS Keychains or Android Keystore / EncryptedSharedPreferences.

### 5.2. WebSockets & Real-Time Sync
* **Web Equivalent**: `laravel-echo` / `pusher-js`.
* **Mobile Translation**:
  * You can use the standard JavaScript `pusher-js` client inside React Native since it supports WebSocket connections.
  * **Flutter**: Use the `laravel_echo` package or `pusher_channels_flutter`.
  * Make sure to bind JWT credentials to authorization headers when connecting to private/presence channels like `private-user.{userId}`.

### 5.3. PDF Rendering & Security
* **Web Equivalent**: `react-pdf` with selection layers disabled (`renderTextLayer={false}`).
* **Mobile Translation**:
  * Use dedicated native PDF viewer libraries (e.g., `react-native-pdf` or Flutter's `flutter_pdfview`).
  * Ensure the document stream is loaded via a secure proxy connection by fetching the blob or byte stream directly using the API client, instead of passing the raw document URL to a webview.
  * Implement screenshot blocking controls if maximum security is required:
    * **React Native**: Use `react-native-screen-guard` or set native layout flags (`FLAG_SECURE` on Android).
    * **Flutter**: Use `secure_application`.

### 5.4. Audio Visualization
* **Web Equivalent**: HTML5 Web Audio API (`AudioContext`) with canvas drawings.
* **Mobile Translation**:
  * Do not use standard WebViews for canvas drawings due to performance overhead.
  * Instead, read the decibel/amplitude output from your media player controller (e.g., `react-native-track-player` or Flutter's `just_audio`).
  * Render equalizer visualizer animations using lightweight rendering engines like **Lottie** or native canvas controls (e.g., `CustomPainter` in Flutter or `Canvas` in Swift/Kotlin).

### 5.5. Text-To-Speech (TTS)
* **Web Equivalent**: Web Speech API (`SpeechSynthesis`).
* **Mobile Translation**:
  * Access the native Text-to-Speech engines on iOS and Android.
  * **React Native**: Use `react-native-tts`.
  * **Flutter**: Use `flutter_tts`.
  * Native engines provide more consistent behavior and support background playback controls.

### 5.6. Certificate Canvas Designer (Konva)
* **Web Equivalent**: `react-konva` (custom canvas coordinates mapping).
* **Mobile Translation**:
  * **Admin/Instructor Template Designer**: It is recommended to keep design tools on web dashboards. If required on mobile, use interactive drag-and-drop coordinate builders.
  * **Student Certificate Preview**: Fetch the template coordinates from `/certificate-template` and draw the layout dynamically using native vector graphics (e.g., `react-native-svg` or `CustomPaint` in Flutter) or display pre-rendered JPG/PNG copies generated server-side.

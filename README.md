# 🌍 GlobeMate — Your Smart Travel Companion

A modern, feature-rich travel planning web application built with vanilla JavaScript, Firebase Authentication, Cloud Firestore, and real-time APIs. Plan trips, explore countries, track currencies, manage packing lists, and more.

![GlobeMate Banner](img2.png)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Data Flow Block Diagram](#data-flow-block-diagram)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Authentication System](#authentication-system)
- [Page Modules](#page-modules)
- [APIs & Integrations — Complete Reference](#apis--integrations--complete-reference)
- [API Data Flow — How Each API Is Fetched & Used](#api-data-flow--how-each-api-is-fetched--used)
- [External Domains Contacted](#external-domains-contacted)
- [Styling & Design](#styling--design)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🎯 Overview

**GlobeMate** is a comprehensive travel assistant that helps travelers:
- **Plan** multi-destination trips with itineraries (manual + AI-generated)
- **Research** country-specific information (visa requirements, culture, currency)
- **Track** real-time currency exchange rates
- **Manage** packing lists and travel documents
- **Explore** interactive maps with location markers and geocoding
- **Stay safe** with health advisories and emergency contacts

The app uses a **Single Page Application (SPA)** architecture with dynamic page loading, smooth transitions, and persistent user sessions via Firebase Authentication.

---

## ✨ Features

### 🏠 Home Page
- Hero section with animated gradient text
- Statistics showcase (195+ countries, 160+ currencies, 7 tools)
- Quick access buttons to Register and Log In

### 🔐 Authentication
- **Register**: Create new accounts with email/password or Google OAuth
- **Login**: Secure login with session persistence
- **User Profile**: Navbar displays logged-in user's name, hides Home tab
- **Logout**: Clean session management, restores default UI
- **Firebase Integration**: Backend authentication with Cloud Firestore profiles collection

### 🗺️ Trip Planner
- Create multi-destination itineraries
- Add activities, notes, and dates for each location
- Visual timeline of your trip
- Save and manage multiple trips
- Country search with REST Countries API autocomplete
- Geolocation-based city detection via Nominatim

### 🤖 AI Trip Planner
- Fully self-contained itinerary generator (JS-only styles)
- Generates day-by-day itineraries with budgets in INR/USD
- Printable trip plans with dedicated print view
- No external AI API — all data is computed locally

### 🏳️ Country Information
- Search 195+ countries with autocomplete suggestions
- View comprehensive country details (capital, population, region, languages, currencies, flag, time zones, calling codes, driving side)
- **Historical Overview** — Wikipedia API integration for country history and culture
- **Important Places to Visit** — Curated tourist attractions with Unsplash images for 16+ countries
- Visa eligibility checker — Compare passport requirements between countries

### 🛡️ Safety Hub
- Health and vaccination requirements
- Emergency contact numbers (police, ambulance, embassy)
- Travel advisories and warnings
- Local laws and customs (hardcoded data — no external API)

### 🎒 Packing List
- Smart packing suggestions by category
- Customizable checklists with add/remove
- Check/uncheck functionality
- Save to local storage

### 💱 Currency Converter
- Real-time exchange rates for 160+ currencies via Exchange Rate API
- Live conversion calculator with amount validation
- Swap from/to currencies
- Hardcoded fallback rates if API fails

### 📄 Documents Manager
- Upload and organize travel documents
- Document type categorization (passport, visa, insurance, tickets)
- List view with delete options
- Local storage persistence

### 🗺️ Interactive Maps
- Leaflet.js with OpenStreetMap tiles
- Forward geocoding search via Nominatim API
- Reverse geocoding on map click
- Marker placement with address details

---

## 🏗️ Architecture

### SPA Modular Architecture

GlobeMate is built as a **Single Page Application (SPA)** using a modular vanilla JavaScript architecture. All navbar sections have separate HTML and JavaScript files. User authentication is handled by **Firebase Authentication** (compat v9 SDK) and user profile data is stored in **Cloud Firestore**.

### How It Works

#### 1. Page Loading System (`page-loader.js`)
- Dynamically loads HTML from `pages/` folder via `fetch()`
- Manages page transitions with fade effects
- Calls module `init()` when page loads
- Calls module `cleanup()` when leaving page
- Handles navigation via `data-tab` attributes on nav links

#### 2. Module Pattern
Every JavaScript module follows this IIFE pattern:

```javascript
(function() {
  'use strict';
  
  const ModuleName = {
    init() {
      // Initialize module when page loads
      this.bindEvents();
      this.loadData();
    },

    bindEvents() {
      // Attach event listeners
    },

    loadData() {
      // Load data from localStorage or APIs
    },

    cleanup() {
      // Clean up before leaving page
    }
  };

  // Expose to global scope
  window.ModuleName = ModuleName;

  // Register with PageLoader
  if (typeof PageLoader !== 'undefined') {
    PageLoader.registerModule('page-id', ModuleName);
  }
})();
```

#### 3. Navigation Flow
```
User clicks nav link (data-tab="page-id")
       │
       ▾
PageLoader intercepts click
       │
       ▾
Calls cleanup() on current module
       │
       ▾
Fetches pages/page-id.html via fetch()
       │
       ▾
Injects HTML into #content-container
       │
       ▾
Calls init() on new module
       │
       ▾
Updates active nav link styling + scrolls to top
```

### Firebase Auth Object (`js/auth.js`)

`auth.js` exports a single IIFE-based `Auth` module attached to `window.Auth`. It is the **only** file that talks to Firebase directly. All other modules call `Auth.*` methods.

| Method | Firebase API Used | Notes |
|---|---|---|
| `initFirebase()` | `firebase.initializeApp()` | Called once on script load; no-op if already init |
| `checkSession()` | `onAuthStateChanged` | Wrapped in Promise; unsubscribes after first event |
| `signUp(name, email, password)` | `createUserWithEmailAndPassword` + `updateProfile` | Firestore profile write is fire-and-forget |
| `login(email, password)` | `signInWithEmailAndPassword` | Synchronous credential check |
| `signInWithGoogle()` | `signInWithPopup(GoogleAuthProvider)` | Firestore upsert is fire-and-forget |
| `logout()` | `auth.signOut()` | Clears IndexedDB session, restores UI |
| `applyLoggedInUI()` | — | DOM-only; no Firebase call |
| `restoreLoggedOutUI()` | — | DOM-only; no Firebase call |

### Firestore Data Model
```
Firestore
└── profiles/          (collection)
    └── {uid}            (document — keyed by Firebase Auth UID)
        ├── full_name: string
        ├── email: string
        └── created_at: ISO 8601 string
```

### Benefits of Modular Architecture
- **Easier Debugging** — Each section's code is isolated; issues in one module don't affect others
- **Better Maintainability** — Find and edit features quickly, add/remove sections by adding/deleting files
- **Improved Performance** — Only necessary JS runs; proper cleanup prevents memory leaks; lazy init for maps
- **Team Collaboration** — Multiple devs can work on different modules with reduced merge conflicts

---

## 📊 Data Flow Block Diagram

### Application-Wide Data Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Click /  │  │  Type /  │  │  Map     │  │  Form    │  │  Page    │        │
│  │  Navigate │  │  Search  │  │  Click   │  │  Submit  │  │  Load    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
└───────┼──────────────┼──────────────┼──────────────┼──────────────┼───────────┘
        │              │              │              │              │
        ▾              ▾              ▾              ▾              ▾
┌───────────────────────────────────────────────────────────────────────────────┐
│                        page-loader.js (SPA Router)                            │
│                                                                               │
│   fetch('pages/{id}.html')  →  inject into #content-container                 │
│   call cleanup() on old module  →  call init() on new module                  │
└──────────────────────────────────┬────────────────────────────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▾                    ▾                     ▾
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  auth.js         │  │  Module JS       │  │  app.js              │
│  (Firebase only) │  │  (Feature logic) │  │  (Utilities)         │
│                  │  │                  │  │                      │
│ ┌──────────────┐ │  │  country-info.js │  │  showToast()         │
│ │ Firebase SDK │ │  │  currency.js     │  │  fetchAPI() wrapper  │
│ │ Auth + Fstor │ │  │  maps.js         │  │  splash screen       │
│ └──────┬───────┘ │  │  trip-planner.js │  │  animations          │
└────────┼─────────┘  │  packing.js      │  └──────────────────────┘
         │            │  safety.js       │
         ▾            │  documents.js    │
┌──────────────────┐  │  trip-ai-plan.js │
│ Firebase Cloud   │  └────────┬─────────┘
│                  │           │
│ ┌──────────────┐ │           ▾
│ │  Auth        │ │  ┌──────────────────────────────────────────┐
│ │ (IndexedDB)  │ │  │         EXTERNAL APIs (fetch)            │
│ ├──────────────┤ │  │                                          │
│ │  Firestore   │ │  │  ┌────────────────────────────────────┐  │
│ │  profiles/   │ │  │  │ restcountries.com/v3.1/all         │  │
│ │  {uid}       │ │  │  │ → country-info.js, trip-planner.js │  │
│ └──────────────┘ │  │  ├────────────────────────────────────┤  │
└──────────────────┘  │  │ en.wikipedia.org/api/rest_v1/      │  │
                      │  │ → country-info.js (history/places) │  │
                      │  ├────────────────────────────────────┤  │
                      │  │ api.exchangerate-api.com/v4/       │  │
                      │  │ → currency.js                      │  │
                      │  ├────────────────────────────────────┤  │
                      │  │ nominatim.openstreetmap.org        │  │
                      │  │ → maps.js, trip-planner.js         │  │
                      │  ├────────────────────────────────────┤  │
                      │  │ {s}.tile.openstreetmap.org         │  │
                      │  │ → maps.js (Leaflet tile layer)     │  │
                      │  └────────────────────────────────────┘  │
                      └──────────────────────────────────────────┘
                                       │
                                       ▾
                      ┌──────────────────────────────────────────┐
                      │           LOCAL STORAGE                  │
                      │                                          │
                      │  Trip data, packing lists, documents,    │
                      │  currency cache, module state            │
                      └──────────────────────────────────────────┘
```

### Authentication Data Flow

```
┌────────────┐     ┌──────────────┐     ┌──────────────────────────┐
│   User     │     │  register.js │     │       auth.js            │
│  (Browser) │     │  / login.js  │     │  (Firebase Gateway)      │
└─────┬──────┘     └──────┬───────┘     └────────────┬─────────────┘
      │                   │                          │
      │  Submit form      │                          │
      ├──────────────────►│                          │
      │                   │  Auth.signUp/login()     │
      │                   ├─────────────────────────►│
      │                   │                          │  createUser / signIn
      │                   │                          ├────────────────────────►  Firebase Auth
      │                   │                          │◄───────────────────────  (credential)
      │                   │                          │
      │                   │                          │  [fire-and-forget]
      │                   │                          │  Firestore profiles/{uid}.set()
      │                   │                          ├────────────────────────►  Cloud Firestore
      │                   │                          │
      │                   │                          │  applyLoggedInUI()
      │                   │                          │  (update navbar DOM)
      │                   │◄─────────────────────────┤
      │  Toast + redirect │                          │
      │◄──────────────────┤                          │
      │                   │                          │
```

### Country Explorer Data Flow

```
User types "Japan"
       │
       ▾
 ┌─────────────────────────────────────────────────────┐
│  country-info.js                                     │
│                                                      │
│  handleSearch("jap")                                 │
│       │                                              │
│       ▾                                              │
│  Filter cached countries[] ◄── loaded once from      │
│  (in-memory array)             restcountries.com     │
│       │                                              │
│       ▾                                              │
│  showSuggestions() ──► User clicks "Japan"           │
│       │                                              │
│       ▾                                              │
│  selectCountry("JPN")                                │
│       │                                              │
│       ├──► displayCountryInfo()     [cached data]    │
│       │    → capital, population,                    │
│       │      languages, flag, etc.                   │
│       │                                              │
│       ├──► loadCountryHistory()     [Wikipedia API]  │
│       │    → GET /page/summary/Japan                 │
│       │    → render data.extract                     │
│       │    → link to full article                    │
│       │                                              │
│       ├──► loadImportantPlaces()    [local DB]       │
│       │    → 4 curated places with                   │
│       │      Unsplash images                         │
│       │    → fallback: Wikipedia                     │
│       │      Tourism in {country}                    │
│       │                                              │
│       └──► Visa checker ready for                    │
│            user interaction                          │
 └─────────────────────────────────────────────────────┘
```

### Currency Conversion Data Flow

```
┌──────────┐       ┌────────────────┐       ┌─────────────────────────┐
│  User    │       │  currency.js   │       │  exchangerate-api.com   │
└────┬─────┘       └───────┬────────┘       └────────────┬────────────┘
     │                     │                             │
     │  Page loads         │                             │
     │────────────────────►│  fetchRates()               │
     │                     ├────────────────────────────►│
     │                     │    GET /v4/latest/USD        │
     │                     │◄────────────────────────────┤
     │                     │    { rates: { EUR: 0.92,    │
     │                     │      GBP: 0.79, ... } }     │
     │                     │                             │
     │                     │  Cache rates in memory      │
     │                     │  (fallback: hardcoded)      │
     │                     │                             │
     │  Enter amount,      │                             │
     │  pick currencies    │                             │
     │────────────────────►│                             │
     │                     │  convert()                  │
     │                     │  amount × (to / from)       │
     │  Display result     │                             │
     │◄────────────────────┤                             │
```

### Maps & Geocoding Data Flow

```
┌──────────┐       ┌────────────────┐       ┌──────────────────────────┐
│  User    │       │    maps.js     │       │  nominatim.              │
│          │       │  (Leaflet.js)  │       │  openstreetmap.org       │
└────┬─────┘       └───────┬────────┘       └────────────┬─────────────┘
     │                     │                             │
     │  Search "Paris"     │                             │
     │────────────────────►│  Forward Geocode            │
     │                     ├────────────────────────────►│
     │                     │  GET /search?q=Paris        │
     │                     │◄────────────────────────────┤
     │                     │  [{lat,lon,display_name}]   │
     │  Map flies to Paris │                             │
     │  + marker added     │                             │
     │◄────────────────────┤                             │
     │                     │                             │
     │  Click on map       │                             │
     │────────────────────►│  Reverse Geocode            │
     │                     ├────────────────────────────►│
     │                     │  GET /reverse?lat=&lon=     │
     │                     │◄────────────────────────────┤
     │                     │  {address: {city, country}} │
     │  Popup shows        │                             │
     │  address info       │                             │
     │◄────────────────────┤                             │
     │                     │                             │
     │           ┌─────────┴──────────┐                  │
     │           │ tile.openstreetmap │                  │
     │           │ .org/{z}/{x}/{y}   │                  │
     │           │ (map tile images)  │                  │
     │           └────────────────────┘                  │
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup |
| **CSS3** | Custom properties, Flexbox, Grid, animations |
| **JavaScript (ES6+)** | Modular IIFE architecture, async/await |
| **Font Awesome 6.5.1** | Icon library (via cdnjs CDN) |
| **Google Fonts** | Inter, Playfair Display, Pacifico, Great Vibes, Dancing Script, Poppins |

### Backend & Services
| Service | Purpose |
|---|---|
| **Firebase Auth (v9 compat)** | Email/password and Google OAuth sign-in |
| **Cloud Firestore** | NoSQL database for user profiles |
| **REST Countries API** | Country data (195+ countries) |
| **Exchange Rate API** | Live currency exchange rates |
| **Wikipedia REST API** | Country history & tourism info |
| **Nominatim (OSM)** | Forward & reverse geocoding |
| **Leaflet.js 1.9.4** | Interactive maps with OSM tiles |
| **Unsplash CDN** | Tourist destination images |

### Build & Deployment
- No build process required (vanilla JS)
- Static site hosting compatible
- Local development with Python HTTP server

---

## 📁 Project Structure

```
Globemate2/
├── index.html                # Main entry point (navbar, footer, Firebase config, all script tags)
├── README.md                 # This file
├── IMAGE_REFERENCES.md       # All Unsplash image URLs used in the app
│
├── css/
│   └── styles.css            # Global styles (3800+ lines)
│
├── js/
│   ├── app.js                # Core utilities (splash screen, toast, fetchAPI wrapper)
│   ├── page-loader.js        # SPA navigation — dynamic page loading system
│   ├── auth.js               # Firebase Auth + Firestore gateway (Auth object)
│   ├── login.js              # Login page module
│   ├── register.js           # Registration page module
│   ├── home.js               # Home/Hero page module
│   ├── trip-planner.js       # Trip Planner module (REST Countries + Nominatim)
│   ├── trip-ai-planner.js    # AI Trip Planner module (self-contained, no external API)
│   ├── country-info.js       # Country Explorer (REST Countries + Wikipedia + Unsplash)
│   ├── safety.js             # Safety Center module (hardcoded data)
│   ├── packing.js            # Packing List module (localStorage)
│   ├── currency.js           # Currency Converter (Exchange Rate API)
│   ├── documents.js          # Document Storage module (localStorage)
│   ├── maps.js               # Maps Explorer (Leaflet + Nominatim geocoding)
│   └── animations.js         # UI animation helpers
│
└── pages/
    ├── home.html             # Hero landing page
    ├── login.html            # Login form
    ├── register.html         # Registration form
    ├── trip-planner.html     # Trip planning interface
    ├── trip-ai-planner.html  # AI trip planner interface
    ├── country-info.html     # Country search & details
    ├── safety.html           # Safety information
    ├── packing.html          # Packing checklist
    ├── currency.html         # Currency converter
    ├── documents.html        # Document manager
    └── maps.html             # Map interface
```

---

## 🚀 Setup Instructions

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server) or any static file server
- Firebase project (for authentication features)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Globemate2
```

### Step 2: Configure Firebase
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods: **Email/Password** and **Google**
3. Enable **Firestore Database** in production or test mode
4. Get your Firebase config object from **Project Settings → General → Your apps**
5. Open `index.html` and update `window.FIREBASE_CONFIG`:
   ```javascript
   window.FIREBASE_CONFIG = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
6. The `profiles` collection in Firestore is created automatically on first sign-up. Each document uses the user's **UID** as its ID and contains:
   ```json
   {
     "full_name": "User Name",
     "email": "user@example.com",
     "created_at": "ISO timestamp"
   }
   ```
7. (Optional) Add a Firestore security rule to restrict profile reads/writes to the owning user:
   ```
   match /profiles/{userId} {
     allow read, write: if request.auth.uid == userId;
   }
   ```

### Step 3: Start Local Server
```bash
# Using Python 3
python -m http.server 8000

# Then open browser to:
# http://localhost:8000
```

### Step 4: Explore the App
- Click **Register** to create an account
- Browse features via the navbar
- Test currency conversion, country search, maps, etc.

---

## 🔐 Authentication System

### Architecture
`js/auth.js` provides a global `Auth` object backed by the **Firebase Auth compat v9 SDK**. The Firebase SDKs are loaded via CDN in `index.html` before any app scripts:

```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
```

The project config is declared as `window.FIREBASE_CONFIG` immediately after.

### Auth Methods

| Method | What it does |
|---|---|
| `initFirebase()` | Initialises Firebase app, Auth, and Firestore (called once on script load) |
| `signUp(name, email, password)` | Creates Firebase user, updates display name, fire-and-forgets Firestore profile write |
| `login(email, password)` | Authenticates via `signInWithEmailAndPassword` |
| `signInWithGoogle()` | OAuth popup via `GoogleAuthProvider`, fire-and-forgets Firestore upsert |
| `logout()` | Calls `auth.signOut()`, restores default UI, redirects to Home |
| `checkSession()` | Wraps `onAuthStateChanged` in a Promise; resolves with current user or null |
| `applyLoggedInUI()` | Updates navbar with user's display name, hides Home tab, adds Logout button |
| `restoreLoggedOutUI()` | Restores default GlobeMate logo and navbar state |

### Authentication Flow
```
User submits form
       │
       ▾
  Auth.signUp() / Auth.login()
       │
       ▾
  firebase.auth().create* / signIn*  ◄── Network call to Firebase
       │
       ▾
  credential.user ← currentUser cached in module closure
       │
       ▾
  [fire-and-forget] Firestore profiles/{uid}.set()
       │
       ▾
  Auth.applyLoggedInUI()  ◄─── Synchronous DOM update
       │
       ▾
  PageLoader.loadPage('country-info')  after 300ms toast
```

### Registration Flow
1. User clicks **Register** button on home page
2. Loads `pages/register.html` (Full Name, Email, Password, Confirm Password fields)
3. `js/register.js` validates inputs locally (name required, passwords match, min 8 chars)
4. Calls `Auth.signUp()` → `firebase.auth().createUserWithEmailAndPassword()`
5. `updateProfile({ displayName: name })` called asynchronously (non-blocking)
6. Firestore `profiles/{uid}` document written asynchronously (fire-and-forget)
7. `Auth.applyLoggedInUI()` updates the navbar immediately
8. Redirects to **Countries** tab after 300ms toast display

### Login Flow
1. User clicks **Log In** or navigates to login page
2. Loads `pages/login.html` (Email, Password fields + Google button)
3. `js/login.js` handles form submission
4. Calls `Auth.login()` → `firebase.auth().signInWithEmailAndPassword()`
5. `Auth.applyLoggedInUI()` updates the navbar immediately
6. Redirects to **Countries** tab after 300ms toast display

### Google OAuth Flow
1. User clicks **Continue with Google** on login or register page
2. `Auth.signInWithGoogle()` triggers `signInWithPopup(new GoogleAuthProvider())`
3. On success, Firestore profile is upserted with `{ merge: true }` (fire-and-forget)
4. UI updated and redirected same as email flow

### Session Persistence
- Firebase Auth persists the session in `IndexedDB` automatically (default browser persistence)
- On app load (`DOMContentLoaded`), `Auth.checkSession()` listens to `onAuthStateChanged` once
- If a session exists, `applyLoggedInUI()` is called before the first page renders
- User stays logged in across refreshes without extra configuration
- Logout calls `auth.signOut()` which clears the persisted session

### UI Changes When Logged In
- **Navbar Logo**: "GlobeMate" → User's name (bold)
- **Home Tab**: Hidden from navbar
- **Logout Button**: Added to navbar
- **Redirection**: Auth pages redirect to Countries if already logged in

---

## 📄 Page Modules

Each page is an independent module following this pattern:

### Module Structure
```javascript
(function () {
  'use strict';

  const ModuleName = {
    init() {
      console.log('🎯 Module loading...');
      // Setup code
    },

    cleanup() {
      console.log('Cleaning up module');
      // Teardown code
    }
  };

  // Register with PageLoader
  if (window.PageLoader) {
    window.PageLoader.registerModule('page-id', ModuleName);
  }
})();
```

### Page Loading Flow
1. User clicks navigation link with `data-tab="page-id"`
2. `PageLoader.loadPage('page-id')` called
3. Fetches `pages/page-id.html` via fetch API
4. Fades out current content (opacity 0)
5. Injects new HTML into `#content-container`
6. Fades in new content (opacity 1)
7. Calls `modules[page-id].init()` if registered
8. Updates navbar active state
9. Scrolls to top smoothly

### Module Details

| Module | File | External API | Storage |
|---|---|---|---|
| Home | `home.js` | None | None |
| Trip Planner | `trip-planner.js` | REST Countries, Nominatim | localStorage |
| AI Trip Planner | `trip-ai-planner.js` | None (all local) | None |
| Country Info | `country-info.js` | REST Countries, Wikipedia, Unsplash | In-memory cache |
| Currency | `currency.js` | Exchange Rate API | In-memory cache |
| Safety | `safety.js` | None (hardcoded) | None |
| Packing | `packing.js` | None | localStorage |
| Documents | `documents.js` | None | localStorage |
| Maps | `maps.js` | Nominatim, OSM Tiles | None |
| Login | `login.js` | Firebase (via Auth) | IndexedDB |
| Register | `register.js` | Firebase (via Auth) | IndexedDB |

---

## 🔌 APIs & Integrations — Complete Reference

### 1. REST Countries API

| Property | Details |
|---|---|
| **Endpoint** | `https://restcountries.com/v3.1/all?fields=name,capital,region,population,languages,currencies,flags,cca3,idd,car` |
| **Second Endpoint** | `https://restcountries.com/v3.1/name/{query}?fields=name,flags,cca3` (trip-planner fallback search) |
| **Used by** | `country-info.js` (main data), `trip-planner.js` (country autocomplete) |
| **Auth** | None — free, open API |
| **Rate Limit** | None |
| **Data Retrieved** | Country names, flags (SVG), capitals, regions, population, languages, currencies, calling codes, driving side, country codes |
| **Caching** | Loaded once on module init and cached in-memory for the session |
| **Docs** | [restcountries.com](https://restcountries.com) |

**How it's fetched:**
```javascript
// country-info.js — on module init
const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,...');
const countries = await response.json();  // Array of 195+ country objects
// Cached in CountryExplorer.countries[] for all subsequent searches
```

**How results are used:**
- Populates search autocomplete with country names + flags
- Renders info cards (capital, region, population, languages, etc.)
- Fills passport dropdown for visa checker
- Provides country data for trip planner destination search

---

### 2. Wikipedia REST API

| Property | Details |
|---|---|
| **Endpoint 1** | `https://en.wikipedia.org/api/rest_v1/page/summary/{countryName}` |
| **Endpoint 2** | `https://en.wikipedia.org/api/rest_v1/page/summary/Tourism in {countryName}` (fallback for places) |
| **Used by** | `country-info.js` |
| **Auth** | None |
| **Rate Limit** | Standard Wikipedia limits (reasonable use) |
| **Data Retrieved** | `extract` (2-3 paragraph summary), `content_urls` (link to full article), `title` |
| **Docs** | [wikimedia.org/api/rest_v1](https://en.wikipedia.org/api/rest_v1/) |

**How it's fetched:**
```javascript
// country-info.js — when user selects a country
const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${country.name.common}`;
const response = await fetch(wikiUrl);
const data = await response.json();
// data.extract → historical overview text
// data.content_urls.desktop.page → "Read more" link
```

**How results are used:**
- **History section**: Renders `data.extract` as 2-3 paragraphs of country history
- **Tourism fallback**: When curated places aren't available for a country, fetches `Tourism in {country}` article summary
- Provides "Read more on Wikipedia" link to full article
- Shows loading spinner during fetch, error message on failure

---

### 3. Exchange Rate API

| Property | Details |
|---|---|
| **Endpoint** | `https://api.exchangerate-api.com/v4/latest/USD` |
| **Used by** | `currency.js` |
| **Auth** | None (free tier) |
| **Rate Limit** | Standard free tier limits |
| **Data Retrieved** | `rates` object — 160+ currency codes mapped to USD exchange rates |
| **Fallback** | Hardcoded rates object if API call fails |

**How it's fetched:**
```javascript
// currency.js — on module init
const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
const data = await response.json();
// data.rates = { EUR: 0.92, GBP: 0.79, INR: 84.0, JPY: 149.5, ... }
```

**How results are used:**
- Stores `data.rates` in memory
- `convert()`: calculates `amount × (rates[toCurrency] / rates[fromCurrency])`
- `swap()`: switches from/to currencies and recalculates
- Falls back to hardcoded rates on network failure

---

### 4. Nominatim (OpenStreetMap) Geocoding API

| Property | Details |
|---|---|
| **Forward Geocode** | `https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=5&addressdetails=1` |
| **Reverse Geocode** | `https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18&addressdetails=1` |
| **Reverse (Trip)** | `https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=10` |
| **Used by** | `maps.js` (search + click), `trip-planner.js` (detect location) |
| **Auth** | None (rate-limited, free service) |
| **Rate Limit** | 1 request/second (best practice) |

**How it's fetched and used:**

```javascript
// maps.js — Forward geocoding (user types location in search box)
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1`
);
const results = await response.json();
// results[0] = { lat, lon, display_name, address: { city, country, ... } }
// → Map flies to coordinates, marker added with popup

// maps.js — Reverse geocoding (user clicks on map)
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
);
const data = await response.json();
// data.address = { city, state, country, ... }
// → Popup shows formatted address at click point

// trip-planner.js — Detect user's city from browser geolocation
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
);
const data = await response.json();
// data.address.city → auto-fills the "From" field
```

---

### 5. OpenStreetMap Tile Server

| Property | Details |
|---|---|
| **URL Pattern** | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| **Used by** | `maps.js` (Leaflet.js tile layer) |
| **Auth** | None |
| **Purpose** | Renders the visual map layer in the interactive map |

**How it's integrated:**
```javascript
// maps.js — Leaflet tile layer initialization
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);
```

---

### 6. Firebase (Auth + Firestore)

| Property | Details |
|---|---|
| **SDK** | Firebase compat v9 via `gstatic.com` CDN |
| **Auth Methods** | `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signInWithPopup` (Google), `signOut`, `onAuthStateChanged`, `updateProfile` |
| **Firestore** | `profiles` collection — one document per user keyed by UID |
| **Session** | Automatic persistence via IndexedDB |
| **Used by** | `auth.js` (exclusively — all other modules go through `Auth.*`) |
| **Auth Required** | **Yes** — Firebase API key in `window.FIREBASE_CONFIG` |
| **Docs** | [firebase.google.com/docs](https://firebase.google.com/docs) |

**How it's integrated:**
```javascript
// auth.js — initialization (called once)
firebase.initializeApp(window.FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.firestore();

// Sign up
const credential = await auth.createUserWithEmailAndPassword(email, password);
await credential.user.updateProfile({ displayName: name });
db.collection('profiles').doc(credential.user.uid).set({  // fire-and-forget
  full_name: name, email: email, created_at: new Date().toISOString()
});

// Login
const credential = await auth.signInWithEmailAndPassword(email, password);

// Google OAuth
const provider = new firebase.auth.GoogleAuthProvider();
const result = await auth.signInWithPopup(provider);

// Session check
auth.onAuthStateChanged(user => { /* user or null */ });
```

---

### 7. CDN Libraries (loaded in `index.html`)

| Library | CDN URL | Purpose |
|---|---|---|
| Font Awesome 6.5.1 | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css` | Icon library |
| Google Fonts | `fonts.googleapis.com/css2?family=...` | Inter, Playfair Display, Pacifico, Great Vibes, Dancing Script, Poppins |
| Leaflet.js 1.9.4 CSS | `unpkg.com/leaflet@1.9.4/dist/leaflet.css` | Map styles |
| Leaflet.js 1.9.4 JS | `unpkg.com/leaflet@1.9.4/dist/leaflet.js` | Map library |
| Firebase App | `gstatic.com/firebasejs/9.23.0/firebase-app-compat.js` | Firebase core |
| Firebase Auth | `gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js` | Authentication SDK |
| Firebase Firestore | `gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js` | Database SDK |

### 8. Image Sources

| Source | URL Pattern | Used for |
|---|---|---|
| Unsplash CDN | `images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop` | Country banners (1200×400) + tourist place cards (400×300) |
| FlagCDN | `flagcdn.com/{code}.svg` | Country flags (fallback) |
| Placeholder | `via.placeholder.com/400x300?text={name}` | Fallback on image load error |

---

## 🔄 API Data Flow — How Each API Is Fetched & Used

### Summary Table

| API | Trigger | File | Fetch Method | Response Format | Caching | Fallback |
|---|---|---|---|---|---|---|
| REST Countries | Module init | `country-info.js` | `fetch()` → `.json()` | Array of country objects | In-memory (session) | Hardcoded fallback data |
| REST Countries | Search input | `trip-planner.js` | `fetch()` → `.json()` | Array of matching countries | None | Silent fail |
| Wikipedia | Country selected | `country-info.js` | `fetch()` → `.json()` | `{ extract, content_urls }` | None | "Info unavailable" message |
| Exchange Rate | Module init | `currency.js` | `fetch()` → `.json()` | `{ rates: { ... } }` | In-memory (session) | Hardcoded rate table |
| Nominatim Search | Search submit | `maps.js` | `fetch()` → `.json()` | Array of `{ lat, lon, display_name }` | None | No results message |
| Nominatim Reverse | Map click / geoloc | `maps.js`, `trip-planner.js` | `fetch()` → `.json()` | `{ address: { city, ... } }` | None | Coordinates shown |
| OSM Tiles | Map render | `maps.js` | Leaflet auto-fetch | PNG tile images | Browser cache | Blank tiles |
| Firebase Auth | Form submit | `auth.js` | Firebase SDK methods | User credential object | IndexedDB (auto) | Error toast |
| Firebase Firestore | After auth | `auth.js` | `db.collection().doc().set()` | None (fire-and-forget) | None | Silent fail |

### Files With No External API Calls

| File | Notes |
|---|---|
| `safety.js` | Uses hardcoded safety data (future: safety index API) |
| `packing.js` | Purely local logic, localStorage only |
| `documents.js` | Purely local logic, localStorage only |
| `home.js` | Static hero page, no external calls |
| `login.js` | Uses `Auth` module but no direct fetch |
| `register.js` | Uses `Auth` module but no direct fetch |
| `animations.js` | UI animations only |
| `trip-ai-planner.js` | All itinerary data computed locally (no external AI API) |
| `page-loader.js` | Only fetches local `pages/{id}.html` files |

---

## 🌐 External Domains Contacted

| Domain | Protocol | Used by | Auth Required |
|---|---|---|---|
| `restcountries.com` | HTTPS | `country-info.js`, `trip-planner.js` | No |
| `api.exchangerate-api.com` | HTTPS | `currency.js` | No (free tier) |
| `nominatim.openstreetmap.org` | HTTPS | `maps.js`, `trip-planner.js` | No (rate-limited) |
| `en.wikipedia.org` | HTTPS | `country-info.js` | No |
| `{s}.tile.openstreetmap.org` | HTTPS | `maps.js` (Leaflet tiles) | No |
| `*.firebaseapp.com` / `*.googleapis.com` | HTTPS | `auth.js` (via Firebase SDK) | **Yes — Firebase API key** |
| `cdnjs.cloudflare.com` | HTTPS | `index.html` (Font Awesome) | No |
| `fonts.googleapis.com` | HTTPS | `index.html` (Google Fonts) | No |
| `unpkg.com` | HTTPS | `index.html` (Leaflet) | No |
| `gstatic.com` | HTTPS | `index.html` (Firebase SDKs) | No |
| `images.unsplash.com` | HTTPS | `country-info.js` (images) | No |
| `flagcdn.com` | HTTPS | `country-info.js` (flags) | No |

> **Note:** The only API key in the project is the Firebase configuration in `index.html`. This is normal for client-side Firebase — security is enforced via Firebase Security Rules, not key secrecy.

---

## 🎨 Styling & Design

### Design System
Located in `:root` CSS variables (`styles.css`):
```css
--primary: #3b82f6;        /* Blue */
--secondary: #8b5cf6;      /* Purple */
--success: #10b981;        /* Green */
--danger: #ef4444;         /* Red */
--dark: #0f172a;           /* Near black */
--gray-*: ...              /* Gray scale */
```

### Typography
- **Body**: Inter (400, 500, 600, 700)
- **Headings**: Playfair Display (600, 700)
- Responsive font sizes with `clamp()`

### Responsive Breakpoints
- Desktop: > 1200px
- Tablet: 768px - 1199px
- Mobile: < 768px

### Animations
- **Fade In**: Opacity 0 → 1
- **Fade In Up**: Opacity + translateY(20px → 0)
- **Scale In**: Scale 0.5 → 1
- **Gradient Shift**: Background position animation
- **Splash Screen**: Logo pulse + progress bar
- **Page Transitions**: 300ms ease

### Key Components

#### Navbar
- Fixed top, transparent on hero pages
- Scrolled state: solid white + shadow
- Mobile: Hamburger menu toggle
- Active tab indicator

#### Buttons
- `.btn-primary`: Solid blue background
- `.btn-outline`: Border only, transparent
- `.btn-lg`: Larger padding for CTAs
- Hover states with scale transform

#### Cards
- White background, rounded corners
- Box shadow for depth
- Hover: Lift effect (translateY -4px)

#### Forms
- Labels with icons
- Input focus: Blue border + shadow
- Validation states (error/success)

#### Toast Notifications
- Success: Green, checkmark icon
- Error: Red, X icon
- Info: Blue, info icon
- Auto-dismiss after 3s

---

## 🧩 Common Patterns

### Saving Data to LocalStorage
```javascript
const data = { /* your data */ };
localStorage.setItem('globemateKey', JSON.stringify(data));
```

### Loading Data from LocalStorage
```javascript
const saved = localStorage.getItem('globemateKey');
const data = saved ? JSON.parse(saved) : [];
```

### Showing Toast Notifications
```javascript
showToast('Success message', 'success');
showToast('Error message', 'error');
showToast('Info message', 'info');
// Global helper defined in app.js — no namespace required
```

### Module API Examples
```javascript
// Trip Planner
TripPlanner.init()           // Initialize module
TripPlanner.saveTrip()       // Save new trip
TripPlanner.deleteTrip(id)   // Delete trip by ID

// Country Explorer
CountryExplorer.init()                  // Initialize module
CountryExplorer.selectCountry(code)     // Load country by code

// Currency Converter
CurrencyConverter.init()                // Initialize module
CurrencyConverter.convert()             // Convert currencies
CurrencyConverter.swap()                // Swap currencies
CurrencyConverter.fetchRates()          // Update rates

// Packing List
PackingList.init()                      // Initialize module
PackingList.generateList()              // Generate packing list
PackingList.toggleItem(id)              // Toggle item check
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| Page not loading | Check that HTML file exists in `pages/` with name matching `data-tab` attribute |
| Module not initializing | Ensure module is registered with PageLoader and script is loaded in `index.html` |
| Events not working after page switch | Re-attach event listeners in module's `init()` method, not globally |
| Data persisting between pages | Implement proper `cleanup()` method to reset module state |
| Firebase auth errors | Verify `FIREBASE_CONFIG` in `index.html` and that Auth/Firestore are enabled in Firebase Console |
| Currency rates not loading | API may be rate-limited; hardcoded fallback rates will be used automatically |
| Map tiles not rendering | Check network connectivity; OSM tile server may have temporary issues |

---

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use ES6+ features (const, let, arrow functions, async/await)
- Follow existing IIFE module pattern
- Comment complex logic
- Keep functions small and focused
- Use semantic HTML5 tags

### Testing Checklist
- [ ] All navigation links work
- [ ] Registration creates a Firebase Auth user and Firestore profile document
- [ ] Login persists session across refresh via Firebase IndexedDB persistence
- [ ] Navbar updates show user name when logged in
- [ ] Home tab hidden after login
- [ ] Logout restores default UI
- [ ] Responsive design works on mobile
- [ ] No console errors

---

## 🚀 Future Enhancements

- [ ] Add webpack/bundler for optimised builds
- [ ] Implement code splitting for better performance
- [ ] Add TypeScript for type safety
- [ ] Create unit tests for each module
- [ ] Add service worker for offline support
- [ ] Implement proper routing with URL hash/history API
- [ ] Firestore security rules — lock `profiles/{uid}` to authenticated owner
- [ ] Firebase Analytics integration for usage tracking
- [ ] Real visa requirement database integration
- [ ] More countries in curated places database
- [ ] Weather information integration
- [ ] Cost of living comparison
- [ ] User reviews and ratings for places
- [ ] Export country information as PDF

---

## 📜 License

This project is open-source and available under the **MIT License**.

```
MIT License

Copyright (c) 2026 GlobeMate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Font Awesome** for comprehensive icon library
- **Google Fonts** (Inter, Playfair Display, Pacifico, Poppins) for typography
- **Firebase** for Authentication and Cloud Firestore database
- **Leaflet.js** for interactive map functionality
- **REST Countries API** for comprehensive country data
- **Wikipedia REST API** for historical and cultural information
- **Exchange Rate API** for live currency conversion rates
- **Nominatim / OpenStreetMap** for geocoding and map tiles
- **Unsplash** for high-quality tourist destination images
- Open-source community for inspiration and support

---

# Real-Time Data Integration Documentation

This document describes the complete integration of real-time Firebase data throughout the Verolabz application, replacing all mock/dummy data with live data from Firebase Authentication and Firestore.

## Overview

All dashboard components now fetch and display real-time data from Firebase:
- User authentication data from Firebase Auth
- User profiles from Firestore `users` collection
- Documents from Firestore `documents` collection
- Real-time statistics and metrics

## Components Updated

### 1. Dashboard (Homepage)

**File:** `src/pages/dashboard/Dashboard.jsx`

**Real-Time Data Sources:**
- **User Name:** Extracted from Firebase Auth `displayName` or Firestore profile
- **Portfolio Views:** `profile.portfolioViews` (real-time from Firestore)
- **Documents Count:** `stats.total` (calculated from user's documents)
- **Projects Count:** `profile.projectsCount` (from Firestore profile)
- **AI Enhancements:** `profile.aiEnhancementsCount` (from Firestore profile)
- **Recent Documents:** Last 5 documents ordered by `updatedAt`

**Hooks Used:**
```javascript
const { user } = useUser();
const { profile, loading: profileLoading } = useUserProfile(user?.uid);
const { documents: recentDocs, loading: docsLoading } = useRecentDocuments(user?.uid, 5);
const { stats, loading: statsLoading } = useDocumentStats(user?.uid);
```

**Key Features:**
- Loading states for all data sections
- Empty state when no documents exist
- Real-time updates when data changes in Firestore
- Formatted dates using Firestore timestamps
- Dynamic greeting using user's first name

### 2. Documents Page

**File:** `src/pages/dashboard/Documents.jsx`

**Real-Time Data Sources:**
- All user documents from Firestore
- Document type, title, description, dates
- Real-time filtering and search

**Features:**
- **Type Filtering:** Filter by resume, proposal, contract, cover letter
- **Search:** Real-time search across title, type, and description
- **Document Actions:** Edit, download, delete
- **Delete Confirmation:** With real-time Firestore updates
- **Empty States:** Context-aware messages based on filters/search
- **Grid Layout:** Responsive card-based document display

**Hooks Used:**
```javascript
const { user } = useUser();
const { documents, loading, refetch } = useDocuments(user?.uid, { type: filterType });
```

**Document Card Display:**
- Document icon
- Title and description
- Type badge with color coding
- Last updated date
- Action buttons (edit, download, delete)

### 3. Settings Page

**File:** `src/pages/dashboard/Settings.jsx`

**Real-Time Data Sources:**
- User email from Firebase Auth
- Display name, username, bio, portfolio URL from Firestore
- User preferences (theme, notifications)
- Account statistics
- Account creation date and last login

**Sections:**

#### Profile Information
- Email (read-only from Firebase Auth)
- Display Name (editable, syncs with Firebase Auth)
- Username (editable, used for public profile URL)
- Portfolio URL (optional external link)
- Bio (500 character limit)

#### Account Statistics
- Documents count
- Projects count
- Portfolio views
- AI enhancements count

#### Preferences
- Theme selection (light/dark/auto)
- Email notifications toggle
- Marketing emails toggle

#### Account Information
- User ID (Firebase UID)
- Member since date
- Last login date

**Features:**
- Form validation
- Real-time save with success/error messages
- Updates both Firestore and Firebase Auth profiles
- Character counter for bio field
- Public profile URL preview

### 4. Sidebar

**File:** `src/components/Sidebar.jsx`

**Real-Time Data:**
- User avatar (generated from initials)
- Display name (from Auth or Firestore)
- Email address
- Sign out functionality

**Avatar Generation:**
```javascript
// Extracts initials from display name or email
// Example: "John Doe" → "JD", "john@example.com" → "J"
```

## Data Flow Architecture

### Authentication Flow

```
1. User signs in → Firebase Auth
2. Auth state changes → useUser hook
3. User context provides user object globally
4. Components access user.uid for queries
```

### Profile Data Flow

```
1. useUser provides user.uid
2. useUserProfile(uid) subscribes to Firestore users/{uid}
3. Real-time listener updates profile state
4. Components re-render with new data
5. Profile changes trigger immediate UI updates
```

### Documents Data Flow

```
1. useDocuments(userId, options) creates Firestore query
2. Real-time listener established (onSnapshot)
3. Documents array updates automatically
4. Filters/search applied client-side
5. CRUD operations trigger Firestore updates
6. UI updates immediately via real-time listener
```

## Firestore Data Schema

### Users Collection (`users/{userId}`)

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  bio: string,
  username: string,
  portfolioUrl: string,
  
  // Statistics (updated by application)
  portfolioViews: number,
  documentsCount: number,
  projectsCount: number,
  aiEnhancementsCount: number,
  
  // Preferences
  preferences: {
    theme: "light" | "dark" | "auto",
    emailNotifications: boolean,
    marketingEmails: boolean
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### Documents Collection (`documents/{documentId}`)

```javascript
{
  userId: string,
  title: string,
  description: string,
  type: "resume" | "proposal" | "contract" | "cover_letter" | "portfolio",
  content: string,
  status: "draft" | "published" | "archived",
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Custom Hooks

### useUser()
- **Source:** `src/lib/authContext.jsx`
- **Returns:** `{ user, loading }`
- **Purpose:** Access current authenticated user globally

### useUserProfile(userId)
- **Source:** `src/hooks/useUserProfile.js`
- **Returns:** `{ profile, loading, error }`
- **Purpose:** Real-time subscription to user profile data
- **Features:** Automatic cleanup on unmount

### useDocuments(userId, options)
- **Source:** `src/hooks/useDocuments.js`
- **Returns:** `{ documents, loading, error, refetch }`
- **Options:**
  - `type`: Filter by document type
  - `status`: Filter by status
  - `limitCount`: Limit results (default: 50)
  - `realtime`: Enable real-time updates (default: true)
  - `orderByField`: Field to sort by (default: "updatedAt")
  - `orderDirection`: Sort direction (default: "desc")

### useRecentDocuments(userId, count)
- **Source:** `src/hooks/useDocuments.js`
- **Returns:** `{ documents, loading, error }`
- **Purpose:** Convenience hook for recent documents

### useDocumentStats(userId)
- **Source:** `src/hooks/useDocuments.js`
- **Returns:** `{ stats, loading, error }`
- **Purpose:** Calculate document statistics by type
- **Stats Object:**
  ```javascript
  {
    total: number,
    resume: number,
    proposal: number,
    contract: number,
    other: number
  }
  ```

## Services Used

### userService.js

Functions used in the application:
- `createUserProfile(userId, userData)` - Create profile on sign up
- `getUserProfile(userId)` - One-time profile fetch
- `updateUserProfile(userId, updates)` - Update profile fields
- `updateUserPreferences(userId, preferences)` - Update preferences
- `updateLastLogin(userId)` - Update last login timestamp
- `incrementUserStat(userId, statField, incrementBy)` - Increment counters
- `syncAuthProfile(userId, authData)` - Sync Auth with Firestore

### documentService.js

Functions used in the application:
- `createDocument(documentData)` - Create new document
- `getDocument(documentId)` - Get single document
- `updateDocument(documentId, updates)` - Update document
- `deleteDocument(documentId)` - Delete document (used in Documents page)

## Empty States & Loading States

All pages implement proper loading and empty states:

### Loading States
```javascript
{loading ? (
  <div className="documents-loading">
    <p>Loading documents...</p>
  </div>
) : (
  // Content
)}
```

### Empty States
- **No documents yet:** Encourages user to create first document
- **No results found:** Shows when filters/search return nothing
- **Zero stats:** Displays "0" instead of "N/A" for counters

## Date Formatting

All dates use consistent formatting:

```javascript
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};
// Output: "Dec 5, 2024"
```

## Real-Time Updates

All data automatically updates when Firestore changes:

1. **Profile updates:** Username, bio, or stats change → UI updates immediately
2. **Document changes:** Create/edit/delete → Document list updates
3. **Stats changes:** Document count updates when documents added/removed
4. **Multi-device sync:** Changes on one device appear on others instantly

## Error Handling

All components handle errors gracefully:

```javascript
const { profile, loading, error } = useUserProfile(user?.uid);

if (error) {
  // Display error message or fallback UI
}
```

## Security Considerations

- All queries filter by `userId` to ensure users only see their own data
- Firestore security rules must be configured (see `FIRESTORE_SETUP.md`)
- No hardcoded data or test credentials in production code
- User IDs come from authenticated Firebase user object only

## Performance Optimizations

1. **Real-time listeners:** Only subscribe when component mounted
2. **Cleanup:** All listeners unsubscribe on unmount
3. **Pagination:** Documents limited to 50 by default
4. **Client-side filtering:** Search/filter happens after data fetch
5. **Loading states:** Prevent UI flashing with proper loading indicators

## CSS Files

- `src/pages/dashboard/Dashboard.css` - Dashboard and Documents shared styles
- `src/pages/dashboard/Settings.css` - Settings page specific styles
- `src/components/Sidebar.css` - Sidebar component styles

## Testing Real-Time Features

To test real-time functionality:

1. Open app in two browser windows/tabs
2. Sign in with the same account
3. Edit profile in one window → See changes in other window
4. Create document in one window → Appears in other window's list
5. Delete document → Removes from both windows immediately

## Migration Notes

**Before:** Dashboard showed hardcoded data:
- "Welcome back, John!"
- 1,234 portfolio views
- 12 documents
- Mock recent documents

**After:** Everything is real-time:
- Name from actual user login
- Real portfolio view count (starts at 0)
- Actual document count from Firestore
- Real recent documents from user's collection

## Future Enhancements

Potential improvements for real-time data:

1. **Offline support:** Use Firestore offline persistence
2. **Optimistic updates:** Update UI before Firestore confirms
3. **Real-time collaboration:** Multiple users editing same document
4. **Activity feed:** Real-time updates of user actions
5. **Push notifications:** Alert users of important changes
6. **Analytics dashboard:** Real-time charts and graphs
7. **Search indexing:** Use Algolia or similar for advanced search

## Troubleshooting

### "No documents" showing when documents exist
- Check Firestore security rules allow read access
- Verify documents have correct `userId` field
- Check browser console for Firestore errors

### Profile not updating
- Ensure `updateUserProfile` is called after edits
- Check Firestore rules allow write access
- Verify user is authenticated

### Stats showing as 0
- Profile fields may not be initialized
- Run user service to initialize stats fields
- Check that stats are being incremented correctly

## Related Documentation

- `FIRESTORE_SETUP.md` - Firestore configuration and security rules
- `src/lib/authContext.jsx` - Authentication context setup
- `src/lib/firebase.js` - Firebase initialization

---

**Last Updated:** December 2024
**Version:** 1.0.0
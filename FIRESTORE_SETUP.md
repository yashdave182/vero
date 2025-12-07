# 🔥 Firebase & Firestore Setup Guide

Complete integration guide for Verolabz Firebase backend.

---

## 📋 Table of Contents

1. [What's Been Set Up](#whats-been-set-up)
2. [Firebase Console Setup](#firebase-console-setup)
3. [Database Structure](#database-structure)
4. [Usage Examples](#usage-examples)
5. [Custom Hooks Reference](#custom-hooks-reference)
6. [API Reference](#api-reference)
7. [Security Rules](#security-rules)
8. [Best Practices](#best-practices)

---

## ✅ What's Been Set Up

### Files Created:

```
src/
├── lib/
│   ├── firebase.js           # Firebase initialization (Auth, Firestore, Analytics)
│   ├── authContext.jsx        # User authentication context & guards
│   ├── firestore.js           # Firestore utilities & helpers
│   ├── userService.js         # User profile CRUD operations
│   └── documentService.js     # Document CRUD operations
├── hooks/
│   ├── useUserProfile.js      # Real-time user profile hook
│   └── useDocuments.js        # Real-time documents hook
└── pages/auth/
    ├── SignIn.jsx             # Email/password & Google sign-in
    └── SignUp.jsx             # Account creation with Firestore profile
```

### Features Integrated:

✅ **Firebase Authentication**
- Email/password authentication
- Google OAuth sign-in
- Protected routes with `RequireAuth`
- User context with `useUser()` hook

✅ **Firestore Database**
- Real-time data synchronization
- User profiles auto-created on sign-up
- Document management (CRUD operations)
- Custom React hooks for easy data access

✅ **Collections Structure**
- `users` - User profiles and settings
- `documents` - Resumes, proposals, contracts
- `portfolios` - Portfolio data
- `projects` - Portfolio projects
- `templates` - Document templates
- `aiEnhancements` - AI processing tracking

---

## 🔧 Firebase Console Setup

### Step 1: Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **verolabz**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable:
   - ✅ **Email/Password**
   - ✅ **Google** (configure OAuth consent screen)

### Step 2: Set Up Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a region (e.g., `us-central1`)
5. Click **Enable**

### Step 3: Configure Security Rules

In **Firestore Database** → **Rules**, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Documents - users can manage their own documents
    match /documents/{documentId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.sharing.isPublic == true);
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Portfolios - users can manage their own portfolios
    match /portfolios/{portfolioId} {
      allow read: if request.auth != null || resource.data.isPublic == true;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Projects - users can manage their own projects
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    // Templates - everyone can read, admins can write
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Click **Publish** to save the rules.

### Step 4: Add Authorized Domains

1. Navigate to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these are added:
   - `localhost` (for development)
   - Your production domain (e.g., `verolabz.app`)

---

## 🗄️ Database Structure

### Collection: `users`

```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  bio: "Freelance designer",
  username: "johndoe123",
  portfolioUrl: "https://verolabz.app/u/johndoe",
  
  // Stats
  portfolioViews: 1234,
  documentsCount: 12,
  projectsCount: 5,
  aiEnhancementsCount: 8,
  
  // Preferences
  preferences: {
    theme: "light",
    emailNotifications: true,
    marketingEmails: false
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### Collection: `documents`

```javascript
{
  userId: "user_id",
  title: "My Resume 2024",
  type: "resume", // resume, proposal, contract, coverLetter, portfolio, other
  status: "draft", // draft, published, archived
  content: "Document content...",
  
  metadata: {
    wordCount: 350,
    tags: ["senior", "developer", "react"],
    templateId: "template_123",
    aiEnhanced: true
  },
  
  sharing: {
    isPublic: false,
    shareLink: "https://verolabz.app/shared/doc123",
    allowedUsers: ["user_id_1", "user_id_2"]
  },
  
  stats: {
    views: 45,
    downloads: 12,
    shares: 3
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `portfolios`

```javascript
{
  userId: "user_id",
  title: "John's Portfolio",
  description: "Web development portfolio",
  isPublic: true,
  customUrl: "johndoe",
  theme: "modern",
  
  sections: {
    about: { enabled: true, content: "..." },
    projects: { enabled: true, projectIds: ["proj1", "proj2"] },
    skills: { enabled: true, items: ["React", "Node.js"] },
    contact: { enabled: true, email: "...", social: {...} }
  },
  
  stats: {
    views: 567,
    clicks: 89
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Collection: `projects`

```javascript
{
  userId: "user_id",
  portfolioId: "portfolio_id",
  title: "E-commerce Website",
  description: "Full-stack web app...",
  imageUrl: "https://...",
  projectUrl: "https://project.com",
  tags: ["react", "node", "mongodb"],
  featured: true,
  order: 1,
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 💻 Usage Examples

### 1. User Authentication

#### Sign Up New User:
```javascript
// Already implemented in SignUp.jsx
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile } from "../lib/userService";

const handleSignUp = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(userCredential.user.uid, { email, displayName });
};
```

#### Sign In:
```javascript
// Already implemented in SignIn.jsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

const handleSignIn = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};
```

#### Sign Out:
```javascript
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const handleSignOut = async () => {
  await signOut(auth);
};
```

### 2. Get Current User

```javascript
import { useUser } from "../lib/authContext";

function MyComponent() {
  const { user, loading } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  
  return <div>Hello, {user.email}</div>;
}
```

### 3. User Profile Operations

#### Get User Profile:
```javascript
import { useUserProfile } from "../hooks/useUserProfile";

function ProfileComponent() {
  const { user } = useUser();
  const { profile, loading, error } = useUserProfile(user?.uid);
  
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{profile.displayName}</h1>
      <p>{profile.bio}</p>
      <p>Documents: {profile.documentsCount}</p>
    </div>
  );
}
```

#### Update User Profile:
```javascript
import { updateUserProfile } from "../lib/userService";

const handleUpdateProfile = async (userId, updates) => {
  const result = await updateUserProfile(userId, {
    displayName: "New Name",
    bio: "Updated bio...",
  });
  
  if (result.success) {
    console.log("Profile updated!");
  }
};
```

### 4. Document Operations

#### Create a Document:
```javascript
import { createDocument, DOCUMENT_TYPES } from "../lib/documentService";

const handleCreateDocument = async (userId) => {
  const result = await createDocument(userId, {
    title: "My Resume",
    type: DOCUMENT_TYPES.RESUME,
    content: "Resume content here...",
    tags: ["senior", "developer"],
  });
  
  if (result.success) {
    console.log("Document created:", result.documentId);
  }
};
```

#### Get User's Documents:
```javascript
import { useDocuments } from "../hooks/useDocuments";

function DocumentsComponent() {
  const { user } = useUser();
  const { documents, loading, error } = useDocuments(user?.uid);
  
  if (loading) return <div>Loading documents...</div>;
  
  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <p>{doc.type} - {doc.status}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Update a Document:
```javascript
import { updateDocument } from "../lib/documentService";

const handleUpdateDocument = async (documentId) => {
  const result = await updateDocument(documentId, {
    title: "Updated Title",
    content: "New content...",
    status: "published",
  });
  
  if (result.success) {
    console.log("Document updated!");
  }
};
```

#### Delete a Document:
```javascript
import { deleteDocument } from "../lib/documentService";

const handleDeleteDocument = async (documentId, userId) => {
  const result = await deleteDocument(documentId, userId);
  
  if (result.success) {
    console.log("Document deleted!");
  }
};
```

### 5. Real-time Updates

Documents automatically sync in real-time:

```javascript
import { useDocuments } from "../hooks/useDocuments";

function RealtimeDocuments() {
  const { user } = useUser();
  const { documents } = useDocuments(user?.uid, { realtime: true });
  
  // documents will automatically update when Firestore data changes!
  return (
    <ul>
      {documents.map(doc => <li key={doc.id}>{doc.title}</li>)}
    </ul>
  );
}
```

---

## 🎣 Custom Hooks Reference

### `useUser()`
Get current authenticated user.

```javascript
const { user, loading } = useUser();
```

### `useUserProfile(userId)`
Get user profile from Firestore with real-time updates.

```javascript
const { profile, loading, error } = useUserProfile(userId);
```

### `useDocuments(userId, options)`
Get user's documents with filtering and real-time updates.

```javascript
const { documents, loading, error, refetch } = useDocuments(userId, {
  type: 'resume',      // Filter by type
  status: 'published', // Filter by status
  limitCount: 10,      // Limit results
  realtime: true,      // Enable real-time updates
});
```

### `useRecentDocuments(userId, count)`
Get most recent documents.

```javascript
const { documents, loading } = useRecentDocuments(userId, 5);
```

### `useDocumentsByType(userId, type)`
Get documents filtered by type.

```javascript
const { documents, loading } = useDocumentsByType(userId, 'resume');
```

### `useDocumentStats(userId)`
Get document statistics.

```javascript
const { stats, loading } = useDocumentStats(userId);
// stats = { total: 12, resume: 3, proposal: 5, contract: 4 }
```

---

## 📚 API Reference

### User Service (`userService.js`)

| Function | Description |
|----------|-------------|
| `createUserProfile(userId, userData)` | Create user profile in Firestore |
| `getUserProfile(userId)` | Get user profile |
| `updateUserProfile(userId, updates)` | Update user profile |
| `updateLastLogin(userId)` | Update last login timestamp |
| `incrementUserStat(userId, field, count)` | Increment user stat counter |
| `updateUserPreferences(userId, prefs)` | Update user preferences |

### Document Service (`documentService.js`)

| Function | Description |
|----------|-------------|
| `createDocument(userId, data)` | Create new document |
| `getDocument(documentId)` | Get document by ID |
| `updateDocument(documentId, updates)` | Update document |
| `deleteDocument(documentId, userId)` | Delete document |
| `getUserDocuments(userId, options)` | Get all user documents |
| `duplicateDocument(documentId, userId)` | Duplicate a document |
| `updateDocumentStatus(documentId, status)` | Update document status |
| `incrementDocumentViews(documentId)` | Increment view count |
| `shareDocument(documentId, isPublic)` | Share document publicly |

### Firestore Utilities (`firestore.js`)

| Function | Description |
|----------|-------------|
| `saveDocument(docRef, data, merge)` | Save/update document |
| `readDocument(docRef)` | Read document |
| `updateDocument(docRef, updates)` | Update specific fields |
| `deleteDocument(docRef)` | Delete document |
| `queryDocuments(collectionRef, constraints)` | Query collection |

---

## 🔒 Security Rules (Already Configured)

Current security setup:

- ✅ Users can only read/write their own data
- ✅ Documents can be shared publicly or privately
- ✅ Portfolio pages can be public or private
- ✅ Templates are read-only for regular users

---

## 🎯 Best Practices

### 1. Error Handling
Always handle errors from async operations:

```javascript
const result = await createDocument(userId, data);
if (!result.success) {
  console.error("Error:", result.error);
  showErrorToUser(result.error);
}
```

### 2. Loading States
Show loading indicators:

```javascript
const { documents, loading } = useDocuments(userId);

if (loading) return <Spinner />;
return <DocumentsList documents={documents} />;
```

### 3. Real-time vs One-time Fetch
Use `realtime: false` for data that doesn't change often:

```javascript
// Real-time (default)
const { documents } = useDocuments(userId);

// One-time fetch
const { documents } = useDocuments(userId, { realtime: false });
```

### 4. Cleanup
Hooks automatically cleanup subscriptions on unmount. No manual cleanup needed!

### 5. Optimistic Updates
For better UX, update UI immediately and sync in background:

```javascript
// Update local state immediately
setLocalDocuments(prev => [...prev, newDoc]);

// Then sync to Firestore
await createDocument(userId, newDoc);
```

---

## 🚀 Next Steps

### Implement These Features:

1. **Portfolio Builder** - CRUD for portfolios collection
2. **Projects Management** - Add/edit/delete portfolio projects
3. **Templates System** - Create reusable document templates
4. **AI Enhancement Tracking** - Log AI operations in `aiEnhancements` collection
5. **File Storage** - Add Firebase Storage for document files/images
6. **Search** - Implement full-text search with Algolia or Cloud Functions
7. **Analytics** - Track usage with Firebase Analytics (already initialized)

### Example: Create Portfolio Service

```javascript
// src/lib/portfolioService.js
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const createPortfolio = async (userId, portfolioData) => {
  const portfolioRef = doc(collection(db, "portfolios"));
  
  await setDoc(portfolioRef, {
    userId,
    ...portfolioData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return { success: true, portfolioId: portfolioRef.id };
};
```

---

## 📞 Support

If you encounter issues:

1. Check Firebase Console logs
2. Review Firestore security rules
3. Verify authentication is enabled
4. Check browser console for errors

---

## 🎉 You're All Set!

Firebase and Firestore are now fully integrated into Verolabz. You can:

- ✅ Authenticate users with email/password and Google
- ✅ Store and retrieve user profiles
- ✅ Manage documents in real-time
- ✅ Use custom React hooks for easy data access
- ✅ Protect routes with authentication guards

Start building features using the APIs and hooks documented above!

---

**Last Updated:** January 2025  
**Version:** 1.0.0
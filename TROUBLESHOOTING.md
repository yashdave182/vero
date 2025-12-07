# Troubleshooting Guide

This guide helps you resolve common issues with the Vero platform.

---

## Issue: "No document to update" Error in Settings

### Symptoms
- When you try to save your profile in Settings, you get an error: `No document to update: projects/verolabz/databases/(default)/documents/users/[USER_ID]`
- This means your user profile document doesn't exist in Firestore

### Solution
**This has been fixed!** The system now automatically creates missing user profiles.

#### What Changed:
1. **Automatic Profile Creation**: When you try to save settings, the system now checks if your profile exists. If not, it creates it automatically.
2. **Better Error Handling**: The `updateUserProfile` function now uses `setDoc` with merge option instead of `updateDoc`, which creates the document if it doesn't exist.
3. **Real-time Updates**: The Settings page uses a real-time listener that automatically updates when your profile changes.

#### Steps to Fix (if you still have issues):
1. **Sign out** and **sign back in**
2. Go to **Settings**
3. Fill in your **Display Name** and **Username** (required!)
4. Click **Save Profile**
5. The system will automatically create your profile if it doesn't exist

---

## Issue: "Please set a username in Settings first" in Portfolio Builder

### Symptoms
- When you click the **Preview** button in Portfolio Builder, you get an error: "Please set a username in Settings first"
- This happens even after you think you've set a username

### Cause
The Portfolio Builder's public URL feature requires:
1. A user profile document to exist in Firestore
2. A valid username field in that profile

### Solution

#### Step 1: Ensure Your Profile Exists
1. Go to **Settings** (left sidebar)
2. Check if your profile information loads
3. If you see "Loading settings..." indefinitely, your profile is missing

#### Step 2: Set Your Username
1. In the **Username** field, enter a unique username
   - Only letters, numbers, and underscores allowed
   - Example: `john_doe`, `jane123`, `designer_pro`
2. Click **Save Profile**
3. Wait for the success message: "Profile updated successfully! You can now use Preview in Portfolio Builder."

#### Step 3: Verify Username is Saved
1. Refresh the Settings page
2. Check if your username is still there
3. If it's gone, there might be a Firestore permissions issue (see below)

#### Step 4: Try Preview Again
1. Go back to **Portfolio Builder**
2. Click **Preview**
3. It should now open your public portfolio in a new tab at `/u/[your-username]`

---

## Issue: Portfolio Preview Opens But Shows Empty/Blank Page

### Symptoms
- Preview opens successfully
- But the portfolio page is blank or shows "Portfolio not found"

### Cause
Either:
1. You haven't published your portfolio yet
2. Your portfolio has no projects
3. The portfolio document wasn't saved properly

### Solution
1. In Portfolio Builder, ensure you have:
   - **Name** filled in
   - **Title** filled in
   - **Bio** filled in
   - At least **1 skill** added
   - At least **1 project** with name, description, and live URL
2. Click **Save Draft** first
3. Then click **Publish**
4. Wait for success message
5. Now click **Preview**

---

## Issue: Project Live URL Iframe Not Loading

### Symptoms
- You've added a project with a live URL
- The iframe preview shows "Preview not available" or blank

### Cause
The target website blocks iframe embedding with security headers:
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `Content-Security-Policy: frame-ancestors 'none'`

### Common Sites That Block Iframes
- Many banking/financial sites
- Some corporate sites
- Sites with strict security policies
- Localhost URLs (won't work from deployed app)

### Solution
1. **Use Publicly Accessible URLs**: Make sure your project is deployed to Vercel, Netlify, GitHub Pages, etc.
2. **Check if Your Site Allows Framing**: Open browser console when viewing the preview. If you see "Refused to display in a frame", the site blocks embedding.
3. **Alternative**: Users can click "Visit Site" overlay to open your project in a new tab (this always works!)

### Recommended Hosting Platforms (iframe-friendly):
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Firebase Hosting
- ✅ Render
- ⚠️ Some Heroku apps (depends on configuration)

---

## Issue: Firestore Permissions Error

### Symptoms
- Console shows: "Missing or insufficient permissions"
- Can't save profile or portfolio

### Cause
Firestore security rules might be too restrictive

### Temporary Solution (Development Only)
If you're testing locally and have Firestore access:

```javascript
// WARNING: Only use in development/testing!
// Firestore Rules (allow all authenticated users)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /documents/{docId} {
      allow read, write: if request.auth != null;
    }
    match /portfolios/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Issue: "Maximum 3 Projects Allowed"

### Symptoms
- Can't add more than 3 projects

### Cause
**This is intentional!** The portfolio builder limits you to 3 projects to keep portfolios focused and professional.

### Solution
- Remove an existing project to add a new one
- Choose your 3 best/most relevant projects
- Quality over quantity!

---

## General Debugging Steps

### 1. Check Browser Console
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for red errors
4. Screenshot and report any Firebase/Firestore errors

### 2. Check Network Tab
1. Press `F12` → **Network** tab
2. Filter by `Fetch/XHR`
3. Look for failed requests (red)
4. Check if Firebase API calls are succeeding

### 3. Verify Firebase Connection
1. Open console
2. Type: `window.firebase` or check if auth object exists
3. If undefined, Firebase might not be initialized

### 4. Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Clear **Cached images and files**
3. Clear **Cookies and site data**
4. Refresh the page

### 5. Try Incognito/Private Mode
- This helps identify if browser extensions or cached data are causing issues

---

## Still Having Issues?

### Before Reporting a Bug:
1. ✅ Sign out and sign back in
2. ✅ Clear browser cache
3. ✅ Try a different browser
4. ✅ Check browser console for errors
5. ✅ Verify internet connection

### What to Include in Bug Report:
- **Exact error message** (screenshot)
- **Steps to reproduce**
- **Browser and version** (Chrome 120, Firefox 121, etc.)
- **Console errors** (F12 → Console → screenshot)
- **What you expected to happen**
- **What actually happened**

---

## Quick Reference: Required Fields

### Settings Profile (to enable Preview):
- ✅ Display Name (required)
- ✅ Username (required for preview)
- ⚪ Bio (optional but recommended)
- ⚪ Portfolio URL (optional)

### Portfolio Builder (to publish):
- ✅ Name
- ✅ Title
- ✅ Bio
- ✅ At least 1 skill
- ✅ At least 1 project with:
  - ✅ Project name
  - ✅ Project description
  - ✅ Live URL (must be valid URL)

---

## Contact Support

If nothing works, reach out with:
- Your user ID (found in Settings → Account Information)
- Screenshots of the error
- Steps you've already tried

---

*Last Updated: 2024*
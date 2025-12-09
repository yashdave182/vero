# Real-Time Firestore Data Integration

## Overview

The dashboard has been fully integrated with Firebase Firestore for real-time data synchronization. All mock data has been replaced with actual Firestore collections and real-time listeners.

## Architecture

### Data Flow
```
User Action → Firestore Collection → Real-time Listener → React Hook → Dashboard Component → UI Update
```

### Collections Structure

#### 1. **users** Collection
Stores user profile and statistics data.

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  bio: string,
  username: string,
  
  // Statistics (real-time counters)
  portfolioViews: number,
  documentsCount: number,
  projectsCount: number,
  aiEnhancementsCount: number,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. **activities** Collection
Tracks user actions and events.

```javascript
{
  userId: string,
  type: string,          // 'document', 'project', 'ai', 'profile'
  action: string,        // 'created', 'updated', 'completed', 'deleted'
  title: string,
  description: string,
  metadata: object,
  createdAt: timestamp
}
```

#### 3. **suggestions** Collection
Stores AI-powered suggestions for users.

```javascript
{
  userId: string,
  type: string,          // 'profile', 'portfolio', 'document', 'project'
  title: string,
  description: string,
  action: string,        // 'update_profile', 'add_project', etc.
  actionUrl: string,
  priority: number,      // 1-5, higher = more important
  status: string,        // 'active', 'dismissed', 'completed'
  metadata: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. **analytics** Collection
Historical snapshots for trend calculation.

```javascript
{
  userId: string,
  portfolioViews: number,
  documents: number,
  projects: number,
  aiEnhancements: number,
  createdAt: timestamp
}
```

#### 5. **documents** Collection
User documents (existing).

```javascript
{
  userId: string,
  title: string,
  type: string,
  status: string,
  content: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 6. **portfolios** Collection
User portfolios (existing).

```javascript
{
  userId: string,
  name: string,
  title: string,
  bio: string,
  skills: array,
  projects: array,
  isPublished: boolean,
  views: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Custom Hooks

### 1. **useUserProfile(userId)**
Real-time user profile data.

```javascript
import { useUserProfile } from '../hooks/useUserProfile';

const { profile, loading, error } = useUserProfile(user?.uid);
```

**Returns:**
- `profile` - User profile object
- `loading` - Boolean loading state
- `error` - Error message if any

### 2. **useDocumentStats(userId)**
Real-time document statistics.

```javascript
import { useDocumentStats } from '../hooks/useDocuments';

const { stats, loading, error } = useDocumentStats(user?.uid);
```

**Returns:**
- `stats` - Object with total, resume, proposal, contract counts
- `loading` - Boolean loading state
- `error` - Error message if any

### 3. **useRecentActivities(userId, count)**
Real-time user activities.

```javascript
import { useRecentActivities } from '../hooks/useActivities';

const { activities, loading, error } = useRecentActivities(user?.uid, 5);
```

**Returns:**
- `activities` - Array of activity objects
- `loading` - Boolean loading state
- `error` - Error message if any

### 4. **useActiveSuggestions(userId, count)**
Real-time AI suggestions.

```javascript
import { useActiveSuggestions } from '../hooks/useSuggestions';

const { suggestions, loading, error } = useActiveSuggestions(user?.uid, 3);
```

**Returns:**
- `suggestions` - Array of suggestion objects
- `loading` - Boolean loading state
- `error` - Error message if any

### 5. **useAnalytics(userId, options)**
Analytics and trend calculation.

```javascript
import { useAnalytics } from '../hooks/useAnalytics';

const { analytics, trends, loading, error } = useAnalytics(user?.uid);
```

**Returns:**
- `analytics` - Current statistics object
- `trends` - Trend indicators for each metric
- `loading` - Boolean loading state
- `error` - Error message if any

**Trend Object Structure:**
```javascript
{
  portfolioViews: { value: 12, isPositive: true },
  documents: { value: 5, isPositive: true },
  projects: { value: 2, isPositive: true },
  aiEnhancements: { value: 3, isPositive: false }
}
```

---

## Dashboard Data Sources

### Portfolio Completion
**Source:** `useUserProfile` hook
**Calculation:** Based on 8 profile fields
```javascript
- displayName
- bio
- username
- projects (length > 0)
- skills (length > 0)
- photoURL
- experience (length > 0)
- education (length > 0)
```

### Stats Cards
| Stat | Source | Collection |
|------|--------|-----------|
| Portfolio Views | `profile.portfolioViews` | users |
| Documents | `stats.total` | documents |
| Projects | `profile.projectsCount` | users |
| AI Enhancements | `profile.aiEnhancementsCount` | users |

### Trend Indicators
**Source:** `useAnalytics` hook
**Calculation:** Compares current stats with historical snapshots from `analytics` collection

### Activity Feed
**Source:** `useRecentActivities` hook
**Collection:** activities
**Display:** Latest 2-3 activities

### AI Suggestions
**Source:** `useActiveSuggestions` hook
**Collection:** suggestions
**Filter:** Only active suggestions
**Display:** Top 1-2 suggestions by priority

---

## Helper Functions

### 1. **logActivity(userId, activityData)**
Create a new activity entry.

```javascript
import { logActivity } from '../hooks/useActivities';

await logActivity(userId, {
  type: 'project',
  action: 'completed',
  title: 'My Portfolio Website',
  description: 'Finished building portfolio website',
  metadata: { projectId: 'abc123' }
});
```

### 2. **createSuggestion(userId, suggestionData)**
Create a new AI suggestion.

```javascript
import { createSuggestion } from '../hooks/useSuggestions';

await createSuggestion(userId, {
  type: 'profile',
  title: 'Improve your About Me section',
  description: 'Add more details about your latest skills',
  action: 'update_profile',
  actionUrl: '/dashboard/portfolio',
  priority: 4
});
```

### 3. **saveAnalyticsSnapshot(userId)**
Save current stats for trend tracking.

```javascript
import { saveAnalyticsSnapshot } from '../hooks/useAnalytics';

await saveAnalyticsSnapshot(userId);
```

**Recommendation:** Run this daily via a scheduled function or cron job.

### 4. **dismissSuggestion(suggestionId)**
Dismiss a suggestion.

```javascript
import { dismissSuggestion } from '../hooks/useSuggestions';

await dismissSuggestion(suggestionId);
```

### 5. **completeSuggestion(suggestionId)**
Mark a suggestion as completed.

```javascript
import { completeSuggestion } from '../hooks/useSuggestions';

await completeSuggestion(suggestionId);
```

---

## Firestore Security Rules

All new collections have appropriate security rules:

### Activities
- Read: Only own activities
- Create: Only for authenticated users
- Update/Delete: Only own activities

### Suggestions
- Read: Only own suggestions
- Create: Only for authenticated users (typically by admin/system)
- Update: Only own suggestions (for status changes)
- Delete: Only own suggestions

### Analytics
- Read: Only own analytics
- Create: Only for authenticated users
- Update/Delete: Disabled (maintains historical integrity)

---

## Real-Time Updates

### How It Works
All hooks use Firestore's `onSnapshot` for real-time listeners:

```javascript
const unsubscribe = onSnapshot(query, (snapshot) => {
  // Update state with new data
  setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Cleanup on unmount
return () => unsubscribe();
```

### Benefits
1. **Instant Updates** - Changes reflect immediately across all devices
2. **No Polling** - Reduces server load and bandwidth
3. **Automatic Sync** - Data stays synchronized automatically
4. **Offline Support** - Firebase handles offline scenarios

---

## Populating Initial Data

### For Development/Testing

#### 1. Create Activities
When a user creates/updates documents or projects, log the activity:

```javascript
// In your document creation function
await logActivity(userId, {
  type: 'document',
  action: 'created',
  title: documentTitle,
  description: `Created new ${documentType}`
});
```

#### 2. Create Suggestions
Generate suggestions based on profile completion:

```javascript
// Check if bio is empty
if (!profile.bio || profile.bio.length < 50) {
  await createSuggestion(userId, {
    type: 'profile',
    title: 'Complete your bio',
    description: 'Add a compelling bio to attract visitors',
    action: 'update_profile',
    actionUrl: '/dashboard/settings',
    priority: 5
  });
}
```

#### 3. Initialize Analytics
Create first snapshot after user signup:

```javascript
// After user creates profile
await saveAnalyticsSnapshot(userId);
```

#### 4. Schedule Daily Snapshots
Use Firebase Cloud Functions or external cron:

```javascript
// Cloud Function (scheduled daily)
exports.dailyAnalyticsSnapshot = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    // Get all users and save snapshots
    const users = await getAllUsers();
    for (const user of users) {
      await saveAnalyticsSnapshot(user.id);
    }
  });
```

---

## Migration from Mock Data

### Before (Mock Data)
```javascript
const portfolioCompletion = 75;
const stats = { views: 128, documents: 24, projects: 8, ai: 15 };
const trends = { views: 12, documents: 5, projects: 2, ai: -3 };
```

### After (Real-Time Data)
```javascript
const { profile } = useUserProfile(user?.uid);
const { stats } = useDocumentStats(user?.uid);
const { trends } = useAnalytics(user?.uid);
const portfolioCompletion = calculatePortfolioCompletion(profile);
```

---

## Performance Optimization

### 1. Limit Queries
All hooks use reasonable limits:
- Activities: Default 10, Dashboard uses 3
- Suggestions: Default 5, Dashboard uses 2
- Analytics: Last 10 snapshots for trend calculation

### 2. Index Creation
Create Firestore indexes for common queries:

```javascript
// Required indexes:
activities: userId (asc), createdAt (desc)
suggestions: userId (asc), status (asc), priority (desc), createdAt (desc)
analytics: userId (asc), createdAt (desc)
```

### 3. Cleanup Listeners
All hooks properly cleanup listeners on unmount to prevent memory leaks.

---

## Troubleshooting

### No Data Showing
1. **Check Firestore Rules** - Ensure user has read permissions
2. **Verify User ID** - Confirm `user?.uid` is defined
3. **Check Console** - Look for Firestore errors in browser console
4. **Empty Collections** - Create initial data using helper functions

### Trends Not Calculating
1. **No Analytics Snapshots** - Create initial snapshot with `saveAnalyticsSnapshot`
2. **Insufficient History** - Need at least 2 snapshots to calculate trends
3. **Recent Signup** - New users won't have historical data yet

### Activities Not Showing
1. **No Logged Activities** - Use `logActivity` when users take actions
2. **Check Time Range** - Activities query is sorted by `createdAt` desc
3. **Verify Collection** - Ensure activities are saved to correct collection

### Real-Time Updates Not Working
1. **Check Internet Connection** - Firestore requires active connection
2. **Verify Listener Setup** - Ensure `realtime: true` in hook options
3. **Check Browser Console** - Look for WebSocket connection errors
4. **Firebase Configuration** - Verify Firebase config is correct

---

## Best Practices

### 1. Activity Logging
Log activities for important user actions:
- ✅ Document created/completed
- ✅ Project added/updated
- ✅ AI feature used
- ✅ Portfolio published
- ❌ Don't log every minor edit

### 2. Suggestion Generation
Create suggestions based on user behavior:
- Profile incomplete → Suggest completing fields
- No projects → Suggest adding first project
- Old documents → Suggest updating/reviewing
- High views but no contact → Suggest adding contact info

### 3. Analytics Snapshots
- Save daily snapshots for accurate trend tracking
- Keep snapshots for at least 90 days
- Use Cloud Functions for automation
- Don't save more than once per day per user

### 4. Data Cleanup
Implement cleanup policies:
- Delete old activities (>90 days)
- Archive dismissed suggestions (>30 days)
- Keep analytics snapshots (historical value)

---

## Testing

### Manual Testing
1. Create a document → Check if activity appears
2. Update profile → Check if completion % updates
3. Wait 5 seconds → Check if trends load
4. Create suggestion → Check if it appears in feed

### Automated Testing
```javascript
// Test activity creation
test('logs activity on document creation', async () => {
  const result = await logActivity(userId, {
    type: 'document',
    action: 'created',
    title: 'Test Doc'
  });
  expect(result.success).toBe(true);
});

// Test suggestion creation
test('creates AI suggestion', async () => {
  const result = await createSuggestion(userId, {
    type: 'profile',
    title: 'Test Suggestion',
    priority: 3
  });
  expect(result.success).toBe(true);
});
```

---

## Future Enhancements

### Planned Features
- [ ] Activity filtering and search
- [ ] Suggestion priority algorithm improvements
- [ ] Advanced analytics dashboard
- [ ] Export activity history
- [ ] Customizable trend periods
- [ ] Activity notifications
- [ ] Suggestion auto-generation based on AI analysis
- [ ] Batch operations for activities

### Potential Optimizations
- [ ] Implement data aggregation for faster queries
- [ ] Add caching layer for frequently accessed data
- [ ] Use composite indexes for complex queries
- [ ] Implement pagination for large activity lists

---

## Summary

The dashboard now uses **100% real-time Firestore data** with no mock data:

| Feature | Data Source | Real-Time |
|---------|-------------|-----------|
| Portfolio Completion | users collection | ✅ Yes |
| Stats Cards | users + documents | ✅ Yes |
| Trend Indicators | analytics collection | ✅ Yes |
| Activity Feed | activities collection | ✅ Yes |
| AI Suggestions | suggestions collection | ✅ Yes |

All data updates automatically and instantly reflects across all user sessions!
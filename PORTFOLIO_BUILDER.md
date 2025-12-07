# Portfolio Builder Documentation

Complete guide to the enhanced Portfolio Builder with real-time Firestore integration, live project previews, and polished UI.

## Overview

The Portfolio Builder allows users to create beautiful, professional portfolios with up to 3 projects. All data is saved to Firestore in real-time and published to a public profile page.

## Features

### ✅ Implemented Features

1. **Real-Time Firestore Integration**
   - Auto-saves to Firestore
   - Loads existing portfolio on mount
   - Real-time updates across devices

2. **Project Management (Max 3 Projects)**
   - Add up to 3 projects
   - Working "Add Project" button
   - Delete projects with confirmation
   - Project counter (e.g., "2/3 projects")

3. **Live URL Preview**
   - Enter live project URL
   - Automatic screenshot preview generation
   - Fallback for failed screenshots
   - "Visit Site" link overlay
   - Similar to Vercel/Netlify deployment previews

4. **Save & Publish System**
   - **Save Draft**: Saves without publishing
   - **Publish**: Validates & publishes portfolio
   - **Update & Publish**: Updates already published portfolio
   - Success/error messages with auto-dismiss

5. **Preview Button**
   - Opens public portfolio in new tab
   - Validates username exists first
   - Shows error if username not set

6. **Form Validation**
   - Required fields: Name, Title, Bio, Skills, Projects
   - Character limit on bio (500 chars)
   - At least 1 skill required
   - At least 1 project required
   - All project fields required (name, description, live URL)

7. **Polished UI**
   - Loading states with spinner
   - Success/error message banners
   - Empty states for skills/projects
   - Character counter for bio
   - Project counter badge
   - Smooth animations and transitions
   - Responsive design
   - Live preview panel (desktop)

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Portfolio Builder              Preview | Save | Publish      │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│   Editor Panel      │      Live Preview Panel              │
│   (Scrollable)      │      (Desktop only)                  │
│                     │                                       │
│ • Basic Info        │   [Avatar]                           │
│ • Skills            │   Name & Title                       │
│ • Social Links      │   Bio                                │
│ • Projects (0/3)    │   Skills                             │
│                     │   Projects                           │
│                     │                                       │
└─────────────────────┴───────────────────────────────────────┘
```

## How to Use

### 1. Fill Basic Information

```javascript
// Required fields
- Full Name *
- Title/Role * (e.g., "Full Stack Developer")
- Bio * (max 500 characters)
```

**Character Counter**: Bio field shows "x/500" live character count.

### 2. Add Skills

- Type skill name in input field
- Press Enter or click "Add" button
- Skills appear as chips with remove (×) button
- At least 1 skill required

### 3. Add Social Links (Optional)

- LinkedIn
- GitHub
- Twitter/X
- Personal Website

All fields are optional but URLs should be complete (include https://).

### 4. Add Projects (1-3 Required)

#### Adding a Project

1. Click "Add Project" button (appears when < 3 projects)
2. Fill in project details:
   - **Project Name*** (required)
   - **Description*** (required)
   - **Live Project URL*** (required, must be valid URL)
   - **GitHub URL** (optional)
   - **Technologies** (press Enter to add)

#### Project Preview

When you enter a Live Project URL, the system automatically:
1. Generates a screenshot of your live site
2. Displays it in the project card
3. Adds a "Visit Site" link overlay
4. Falls back to placeholder if screenshot fails

**Screenshot API**: Uses `api.apiflash.com` for screenshot generation.

#### Managing Projects

- **Delete**: Click trash icon in project header
- **Edit**: All fields update in real-time
- **Reorder**: Projects appear in order added (1, 2, 3)

### 5. Preview Your Portfolio

Click the **Preview** button to:
- Open your public portfolio in a new tab
- View at: `yourdomain.com/u/[username]`
- Requires username to be set in Settings first

### 6. Save Your Work

**Save Draft** button:
- Saves all changes to Firestore
- Does NOT publish publicly
- Portfolio remains unpublished
- Use this while working

### 7. Publish Portfolio

**Publish** button:
1. Validates all required fields
2. Shows error if validation fails
3. Saves to Firestore
4. Marks portfolio as published
5. Makes portfolio visible at public URL

**Validation Requirements**:
- ✓ Name, title, bio filled
- ✓ At least 1 skill
- ✓ At least 1 project
- ✓ All project fields complete

## Data Structure

### Firestore Schema

Portfolio saved to: `portfolios/{userId}`

```javascript
{
  userId: string,
  name: string,
  title: string,
  bio: string,
  skills: string[],
  socials: {
    linkedin: string,
    github: string,
    twitter: string,
    portfolio: string
  },
  projects: [
    {
      id: string,
      name: string,
      description: string,
      tech: string[],
      liveUrl: string,
      githubUrl: string,
      image: string,
      createdAt: string
    }
  ],
  isPublished: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp
}
```

## Live Preview Features

### Screenshot Generation

The portfolio builder automatically generates screenshots of your live projects:

**How it works:**
1. User enters live URL (e.g., `https://myproject.com`)
2. System calls screenshot API: `api.apiflash.com`
3. Screenshot displays in project card (600x400px)
4. Hover reveals "Visit Site" link
5. Fallback icon shows if screenshot fails

**API Parameters:**
- Width: 600px
- Height: 400px
- Format: JPEG
- Quality: 80

**Limitations:**
- Demo API key (replace in production)
- May fail for localhost URLs
- Requires valid, accessible URLs
- Screenshots may take 2-3 seconds to load

### Alternative Screenshot APIs

If you want to change the screenshot service:

```javascript
// Current (APIFlash - Free Demo)
const getScreenshotUrl = (url) => {
  return `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&width=600&height=400`;
};

// Alternative: ScreenshotAPI.net
const getScreenshotUrl = (url) => {
  return `https://shot.screenshotapi.net/screenshot?token=YOUR_KEY&url=${encodeURIComponent(url)}&width=600&height=400`;
};

// Alternative: Thumbnail.ws
const getScreenshotUrl = (url) => {
  return `https://api.thumbnail.ws/api/YOUR_KEY/thumbnail/get?url=${encodeURIComponent(url)}&width=600`;
};
```

## UI States

### Loading State
- Shows spinner with "Loading portfolio..." text
- Displayed while fetching data from Firestore
- Prevents interaction until loaded

### Empty States
- **No Skills**: "No skills added yet" message
- **No Projects**: Large empty state with "Add Your First Project" button
- Encourages user to add content

### Success Messages
- Green banner at top
- Auto-dismisses after 5 seconds
- Examples:
  - "Portfolio saved successfully!"
  - "Portfolio published successfully!"
  - "Project deleted successfully"

### Error Messages
- Red banner at top
- Auto-dismisses after 5 seconds
- Examples:
  - "Maximum 3 projects allowed"
  - "Please set a username in Settings first"
  - "Name is required"
  - "At least one skill is required"

## Validation Rules

### Required Fields (*)
- Full Name
- Title/Role
- Bio (max 500 characters)
- At least 1 skill
- At least 1 project with:
  - Project name
  - Description
  - Live URL

### Optional Fields
- All social links
- GitHub URL per project
- Technologies per project

### Constraints
- Maximum 3 projects
- Bio: 500 character limit
- Skills: No duplicates allowed
- Technologies: No duplicates per project

## Responsive Design

### Desktop (> 1200px)
- Split view: Editor + Live Preview
- Preview updates in real-time
- Comfortable editing experience

### Tablet (768px - 1200px)
- Editor only (preview hidden)
- Full-width editor panel
- Use "Preview" button to view

### Mobile (< 768px)
- Stacked buttons
- Single column layout
- Touch-optimized controls
- Full-width inputs

## Keyboard Shortcuts

- **Enter** in skill input → Add skill
- **Enter** in tech input → Add technology
- Form inputs support standard navigation

## Best Practices

### For Users

1. **Use Real URLs**: Enter complete URLs starting with `https://`
2. **Quality Screenshots**: Ensure your live sites are accessible
3. **Concise Descriptions**: Keep project descriptions under 150 chars for best preview
4. **Select Relevant Skills**: Choose 5-10 most relevant skills
5. **Save Often**: Use "Save Draft" frequently while editing
6. **Preview Before Publishing**: Always preview before publishing

### For Developers

1. **API Keys**: Replace demo API key with your own
2. **Error Handling**: All operations have try-catch blocks
3. **Loading States**: Every async operation shows loading state
4. **Validation**: Client-side validation before Firestore writes
5. **Real-time Updates**: Use Firestore listeners for live data

## Firestore Operations

### Save Portfolio
```javascript
await savePortfolio(userId, portfolioData);
// Creates or updates portfolio document
```

### Publish Portfolio
```javascript
await publishPortfolio(userId);
// Sets isPublished: true
// Adds publishedAt timestamp
```

### Delete Project
```javascript
await deleteProject(userId, projectId);
// Removes project from array
// Updates projectsCount in user profile
```

### Get Portfolio
```javascript
const result = await getPortfolio(userId);
// Fetches user's portfolio
// Returns { success, data, error }
```

## Public Portfolio URL

Published portfolios are accessible at:
```
https://yourdomain.com/u/[username]
```

**Requirements:**
- Portfolio must be published
- Username must be set in Settings
- User must have valid profile

## Troubleshooting

### "Maximum 3 projects allowed"
- Delete a project before adding new one
- Limit enforced to maintain quality

### "Please set a username in Settings first"
- Go to Settings page
- Set a unique username
- Return to Portfolio Builder

### Screenshot not loading
- Verify URL is accessible and valid
- Check if URL starts with `https://`
- Localhost URLs won't work
- May need to wait 2-3 seconds

### Changes not saving
- Check browser console for errors
- Verify internet connection
- Ensure logged in
- Check Firestore security rules

### Preview button not working
- Username must be set in Settings
- Portfolio doesn't need to be published for preview
- Check browser popup blocker

## Services Used

### portfolioService.js
- `savePortfolio()` - Save/update portfolio
- `getPortfolio()` - Get user portfolio
- `publishPortfolio()` - Publish portfolio
- `deleteProject()` - Delete project
- `validatePortfolio()` - Validate before publish
- `getPortfolioUrl()` - Generate public URL

### userService.js
- `updateUserProfile()` - Update project count

## Future Enhancements

Potential features for future versions:

1. **Project Ordering**: Drag-and-drop reorder
2. **Custom Themes**: Color scheme customization
3. **Image Upload**: Upload custom project images
4. **Video Demos**: Embed project demo videos
5. **Analytics**: Track portfolio views
6. **Custom Domain**: Use personal domain
7. **PDF Export**: Download portfolio as PDF
8. **More Projects**: Allow 5+ projects for premium users
9. **Templates**: Pre-made portfolio layouts
10. **SEO Settings**: Custom meta tags

## Related Files

- `src/pages/dashboard/PortfolioBuilder.jsx` - Main component
- `src/pages/dashboard/PortfolioBuilder.css` - Styles
- `src/lib/portfolioService.js` - Firestore operations
- `src/pages/PublicPortfolio.jsx` - Public view (separate component)

## Security Notes

- All operations check user authentication
- Firestore rules must verify userId matches auth
- Screenshot API uses demo key (replace in production)
- Published portfolios are public
- Unpublished portfolios are private

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
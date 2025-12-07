# Live Preview Troubleshooting Guide

## Overview

The Portfolio Builder now includes **two preview methods** for your live projects:

1. **Screenshot Preview** - Takes a snapshot of your live site
2. **Live Iframe Preview** - Embeds your site directly (real-time)

## How to Use

### Screenshot Preview (Default)

1. Enter your Live Project URL
2. Wait 2-3 seconds for screenshot to load
3. If screenshot appears ✓ - You're good!
4. If it shows "Screenshot loading..." - Try iframe mode

### Live Iframe Preview

1. Click the **"Live Iframe"** button at top of preview
2. Your site loads directly in the preview box
3. This is a real embedded version of your site

## Why Screenshot Might Not Load

### Common Issues:

1. **CORS / Security Restrictions**
   - Some websites block being embedded/screenshotted
   - Solution: Use iframe mode instead

2. **URL Not Accessible**
   - Site might be down
   - URL might be incorrect
   - Localhost URLs won't work (need deployed site)

3. **Screenshot API Limits**
   - Free tier has usage limits
   - May be slow during peak hours
   - Solution: Switch to iframe or try again later

4. **SSL/HTTPS Issues**
   - Site must be accessible over HTTPS
   - Mixed content may cause issues

## Screenshot API Options

### Currently Using: Thum.io

**URL Format:**
```
https://image.thum.io/get/width/600/crop/400/noanimate/[YOUR_URL]
```

**Pros:**
- No API key required
- Fast loading
- Good quality

**Cons:**
- Free tier has limits
- May not work for all sites

### Alternative 1: ScreenshotMachine

To switch to ScreenshotMachine, edit `PortfolioBuilder.jsx`:

```javascript
const getScreenshotUrl = (url) => {
  return `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&dimension=600x400`;
};
```

**Pros:**
- Demo key available
- Reliable service
- Good support

**Cons:**
- Demo key has limits
- Paid plans needed for production

### Alternative 2: Microlink

```javascript
const getScreenshotUrl = (url) => {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
};
```

**Pros:**
- Free tier available
- Good documentation
- Reliable

**Cons:**
- Slower than others
- Rate limits on free tier

### Alternative 3: Get Your Own API Key

For production use, get a paid API key from:

1. **APIFlash** - https://apiflash.com
   - $9/month for 100,000 screenshots
   - Fast and reliable

2. **ScreenshotAPI.net** - https://screenshotapi.net
   - $19/month for 50,000 screenshots
   - Good quality

3. **Screenshot.rocks** - https://screenshot.rocks
   - $29/month unlimited
   - Simple pricing

## Iframe Preview

### When to Use Iframe:

✓ **Use Iframe when:**
- Screenshot fails to load
- You want to show interactive elements
- Your site allows iframe embedding
- You want real-time preview

✗ **Don't use Iframe when:**
- Site has `X-Frame-Options` header blocking embedding
- Site uses framebuster scripts
- You want a static image

### Testing Iframe Compatibility

Try loading your site in an iframe:

```html
<iframe src="YOUR_URL" width="600" height="400"></iframe>
```

If it loads, iframe preview will work!

## Best Practices

### 1. Use Complete URLs
```
✓ https://myproject.vercel.app
✓ https://mywebsite.com
✗ mywebsite.com (missing https://)
✗ localhost:3000 (not publicly accessible)
```

### 2. Ensure Site is Live
- Deploy your project first
- Test URL in browser before adding
- Make sure it's publicly accessible

### 3. Choose Right Preview Method

**Screenshot for:**
- Static sites
- Landing pages
- Documentation sites
- Sites you want as image

**Iframe for:**
- Interactive demos
- Web apps
- When screenshot fails
- Real-time content

### 4. Fallback Strategy

If screenshot doesn't load:
1. Wait 5 seconds (API might be slow)
2. Check URL is correct
3. Try iframe mode
4. Verify site is accessible in new tab
5. Try different screenshot API

## Changing Screenshot API

### Step 1: Open PortfolioBuilder.jsx

Find the `getScreenshotUrl` function around line 232:

```javascript
const getScreenshotUrl = (url) => {
  if (!url) return null;
  
  // Change this line:
  return `https://image.thum.io/get/width/600/crop/400/noanimate/${encodeURIComponent(url)}`;
};
```

### Step 2: Replace with Alternative

Choose one of the alternatives from above and replace the return statement.

### Step 3: Test

1. Save file
2. Refresh your browser
3. Enter a URL
4. Check if screenshot loads

## Quick Fixes

### "Preview not available" shows immediately

**Problem:** Screenshot API failed instantly

**Solutions:**
1. Click "Try Live Iframe" button
2. Check your internet connection
3. Verify URL is correct
4. Try different screenshot API

### Screenshot takes forever to load

**Problem:** API is slow or URL is complex

**Solutions:**
1. Wait up to 10 seconds
2. Switch to iframe mode
3. Use simpler URL (avoid URL parameters)
4. Try during off-peak hours

### Iframe shows blank page

**Problem:** Site blocks iframe embedding

**Solutions:**
1. Check browser console for errors
2. Look for `X-Frame-Options` error
3. Use screenshot mode instead
4. Some sites (like Google, Facebook) block iframes for security

### Screenshot shows old version of site

**Problem:** Screenshot is cached

**Solutions:**
1. Add cache-busting parameter to URL
2. Wait 24 hours for cache to clear
3. Use iframe for latest version
4. Clear browser cache

## Production Setup

### For Live Production Sites:

1. **Get Paid API Key**
   - Choose service from alternatives above
   - Sign up and get API key
   - Much higher rate limits

2. **Update Code**
   ```javascript
   const getScreenshotUrl = (url) => {
     // Use your API key
     return `https://api.screenshotapi.net/screenshot?token=YOUR_API_KEY&url=${encodeURIComponent(url)}&width=600&height=400`;
   };
   ```

3. **Store Key Securely**
   ```javascript
   // .env.local
   VITE_SCREENSHOT_API_KEY=your_key_here
   
   // In code
   const apiKey = import.meta.env.VITE_SCREENSHOT_API_KEY;
   ```

4. **Add Error Handling**
   ```javascript
   const getScreenshotUrl = (url) => {
     try {
       // Your API call
       return screenshotUrl;
     } catch (error) {
       console.error('Screenshot failed:', error);
       return null;
     }
   };
   ```

## FAQs

### Q: Why can't I see my localhost projects?

**A:** Screenshot APIs need publicly accessible URLs. Deploy your project to Vercel, Netlify, or similar service first.

### Q: Does this cost money?

**A:** The default setup uses free APIs with usage limits. For production, paid plans recommended ($10-30/month).

### Q: Can I disable previews?

**A:** Yes, just don't fill in the Live URL field. It's optional in the editor.

### Q: Which preview mode is better?

**A:** 
- **Screenshot**: Better for portfolios (static image)
- **Iframe**: Better for testing and interactive demos

### Q: How do I report preview issues?

**A:** Check browser console (F12) for errors. Most issues are:
1. CORS/Security restrictions
2. Invalid URLs
3. API rate limits
4. Network problems

## Advanced: Custom Screenshot Service

### Option 1: Use Your Own Server

```javascript
// Backend (Node.js + Puppeteer)
const puppeteer = require('puppeteer');

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const screenshot = await page.screenshot();
  await browser.close();
  res.send(screenshot);
});

// Frontend
const getScreenshotUrl = (url) => {
  return `https://yourserver.com/screenshot?url=${encodeURIComponent(url)}`;
};
```

### Option 2: Use Cloudflare Workers

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    // Use screenshot API
    const screenshot = await fetch(`https://api.screenshot.com?url=${targetUrl}`);
    return screenshot;
  }
}
```

## Summary

**Default Setup:**
- Uses Thum.io (free, no key needed)
- Falls back to iframe on failure
- Works for most use cases

**For Production:**
- Get paid API key
- Add proper error handling
- Monitor usage/costs
- Consider caching screenshots

**Best User Experience:**
- Provide both screenshot and iframe options
- Show loading states
- Handle errors gracefully
- Test with various URLs

---

**Need Help?** 
- Check browser console for errors
- Try different preview modes
- Verify URL is publicly accessible
- Contact API provider support

**Last Updated:** December 2024
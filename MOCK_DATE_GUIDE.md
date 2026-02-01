# Mock Date Development Guide

This project includes a comprehensive mock date system for development and testing purposes. It allows you to test the schedule dashboard with different dates and times without waiting for real time to pass.

## Quick Start

### Method 1: Using the Dev Debug Panel (Easiest)

When running in development mode (`npm run dev`), a floating **🛠️ button** appears in the bottom-right corner of the screen.

1. Click the **🛠️ button** to open the Debug Panel
2. Enter a date in `YYYY-MM-DD` format (e.g., `2025-02-15`)
3. Optionally enter a time in `HH:MM` format (e.g., `14:30`)
4. Click **Apply Mock** or press Enter
5. Use the **Quick Presets** buttons for common times (8 AM, Noon, 6 PM, etc.)
6. Click **Clear Mock** to return to real time

### Method 2: Using URL Query Parameters

Add these parameters to your dev URL:

```
http://localhost:5173/?mockDate=2025-02-15&mockTime=14:30
```

- `mockDate`: Date in `YYYY-MM-DD` format (required)
- `mockTime`: Time in `HH:MM` format (optional, defaults to `00:00`)

### Method 3: Using Browser Developer Tools (localStorage)

In the browser's JavaScript console:

```javascript
// Set a mock date
localStorage.setItem('mockDate', '2025-02-15');
localStorage.setItem('mockTime', '14:30');

// Then reload the page
location.reload();

// Or use the composable directly
import { setMockDate } from './composables/useMockDate'
setMockDate('2025-02-15', '14:30');

// Clear mocking
localStorage.removeItem('mockDate');
localStorage.removeItem('mockTime');
location.reload();
```

## Implementation Details

### Files Modified/Created

1. **`src/composables/useMockDate.js`** (NEW)
   - Core mock date system
   - Functions: `initMockDate()`, `setMockDate()`, `clearMockDate()`, `getMockedDate()`
   - Exports reactive `isMocking`, `mockDate`, `mockTime` refs

2. **`src/composables/useCurrentTime.js`** (MODIFIED)
   - Updated `getCurrentTimeGMT7()` to check for mocked dates
   - If mocking is enabled, returns the mocked time instead of real time
   - All other time utilities automatically use the mocked time

3. **`src/components/DevDebugPanel.vue`** (NEW)
   - Visual UI for managing mock dates
   - Only visible in development mode (`import.meta.env.DEV`)
   - Shows current mocking status with styled indicators

4. **`src/App.vue`** (MODIFIED)
   - Added `<DevDebugPanel />` component for dev tools

5. **`src/main.js`** (MODIFIED)
   - Added `initMockDate()` call on app startup
   - Automatically initializes from query params or localStorage

## How It Works

The system works by:

1. On app startup, `initMockDate()` checks for:
   - Query parameters (`?mockDate=...`)
   - localStorage values (persistent between sessions)

2. If a mock date is found, it's stored in reactive refs that are globally accessible

3. The `getCurrentTimeGMT7()` function (used throughout the app) checks `isMocking.value`:
   - If true: returns the mocked time from `getMockedDate()`
   - If false: returns the real current time

4. All schedule calculations (active sessions, next sessions, etc.) automatically use the correct time source

## Testing Examples

### Test Morning Class
```
?mockDate=2025-02-03&mockTime=08:00
```

### Test Afternoon Session
```
?mockDate=2025-02-05&mockTime=14:30
```

### Test Different Week
```
?mockDate=2025-02-17&mockTime=12:00
```

## Why This is Useful

- **Test different times**: See how the UI shows active/upcoming sessions without waiting
- **Debug edge cases**: Test behavior at specific times (e.g., between sessions)
- **Development workflow**: Quickly iterate on time-dependent features
- **Demo purposes**: Show the dashboard with relevant active sessions
- **No production impact**: Completely development-only (disabled in production builds)

## Features

✅ Query parameter support
✅ localStorage persistence
✅ Beautiful debug UI panel
✅ Development-only (zero overhead in production)
✅ Console logging for debug awareness
✅ Quick preset buttons (8 AM, Noon, 6 PM, etc.)
✅ Automatic GMT+7 timezone handling
✅ Real-time toggle between mock and real time
✅ Works with entire schedule system (active sessions, next sessions, etc.)

## Notes

- Mock dates are stored in localStorage, so they persist across page reloads (until manually cleared)
- The debug panel only appears in development mode (`npm run dev`)
- The timezone is still GMT+7 (Asia/Jakarta) - mocked times are interpreted in this timezone
- Console shows colored messages when mock mode is enabled/disabled for visibility

import { SESSION_LAST_ACTIVITY } from "./constants";

export const SESSION_TIMEOUT_HOURS = 1; // 1 hour timeout

// For testing purposes - you can temporarily change this to a smaller value
// export const SESSION_TIMEOUT_HOURS = 0.01; // 36 seconds for testing

export function updateSessionActivity(embedId) {
  const activityKey = `${SESSION_LAST_ACTIVITY}_${embedId}`;
  const now = Date.now();
  localStorage.setItem(activityKey, now.toString());
  console.log(`Session activity updated for ${embedId} at ${new Date(now).toISOString()}`);
}

export function shouldResetSession(embedId) {
  const activityKey = `${SESSION_LAST_ACTIVITY}_${embedId}`;
  const lastActivity = localStorage.getItem(activityKey);
  
  if (!lastActivity) {
    // No previous activity, start fresh
    updateSessionActivity(embedId);
    return false;
  }
  
  const lastActivityTime = parseInt(lastActivity, 10);
  const now = Date.now();
  const hoursSinceLastActivity = (now - lastActivityTime) / (1000 * 60 * 60);
  
  console.log(`Session check for ${embedId}: ${hoursSinceLastActivity.toFixed(2)} hours since last activity`);
  
  // Reset if more than 1 hour has passed
  if (hoursSinceLastActivity >= SESSION_TIMEOUT_HOURS) {
    console.log(`Session expired for ${embedId}, will reset`);
    // Clear the activity timestamp to force a fresh start
    localStorage.removeItem(activityKey);
    return true;
  }
  
  return false;
}

export function clearSessionActivity(embedId) {
  const activityKey = `${SESSION_LAST_ACTIVITY}_${embedId}`;
  localStorage.removeItem(activityKey);
}

// For testing: manually expire a session
export function manuallyExpireSession(embedId) {
  const activityKey = `${SESSION_LAST_ACTIVITY}_${embedId}`;
  // Set activity to 2 hours ago to force expiration
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
  localStorage.setItem(activityKey, twoHoursAgo.toString());
  console.log(`Manually expired session for ${embedId}`);
} 
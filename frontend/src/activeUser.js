// activeUser.js
// Single source for current user ID in this MVP.
// In future, replace this with real auth / JWT session and set user from login.

const DEFAULT_USER_ID = "ashwanth_demo";

export function getCurrentUserId() {
  try {
    const stored = localStorage.getItem("organic_user_id");
    if (stored && stored.trim().length > 0) return stored.trim();
  } catch (err) {
    // localStorage may be unavailable in some environments.
  }
  return DEFAULT_USER_ID;
}

export function setCurrentUserId(userId) {
  if (typeof userId !== "string" || userId.trim().length === 0) return;
  try {
    localStorage.setItem("organic_user_id", userId.trim());
  } catch (err) {
    console.warn("Failed to set user id", err);
  }
}

export function getDefaultUserId() {
  return DEFAULT_USER_ID;
}

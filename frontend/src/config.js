// src/config.js

// Create React App requires the REACT_APP_ prefix to expose variables
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';

export const logEnv = () => {
  console.log("%c[Organic Buddy] System Initialized", "color: #10b981; font-weight: bold;");
  if (process.env.REACT_APP_BACKEND_URL) {
    console.log(`%c[Backend] Connected to: ${API_BASE_URL}`, "color: #3b82f6;");
  } else {
    console.log(`%c[Backend] Using default: ${API_BASE_URL}`, "color: #64748b;");
  }
};
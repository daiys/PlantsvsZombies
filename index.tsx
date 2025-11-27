import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("--------------------------------------------------");
console.log("🚀 Starting React vs Zombies application...");
console.log("Environment check:", { 
  userAgent: navigator.userAgent, 
  screen: `${window.innerWidth}x${window.innerHeight}` 
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ FATAL: Root element 'root' not found in DOM!");
} else {
  console.log("✅ Root element found. Attempting to mount React...");
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ ReactDOM.createRoot called successfully.");
    console.log("✨ App should be visible now.");
    console.log("ℹ️ If screen is still black, check for errors in components.");
  } catch (err) {
    console.error("❌ React Mount Failed:", err);
  }
}

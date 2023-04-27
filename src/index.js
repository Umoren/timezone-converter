import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const Main = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);


  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              setShowUpdateNotification(true); // Show the nudge notification
            } else {
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    });
  }

  return (
    <>
      <App />
      {showUpdateNotification && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white py-2 px-4 flex items-center justify-between">
          <span>New content is available! Refresh the page to update.</span>
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}
    </>
  )

}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
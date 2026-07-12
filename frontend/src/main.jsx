import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { TimerProvider } from './context/TimerContext.jsx';
import { FocusModeProvider } from './context/FocusModeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {/* TimerProvider and FocusModeProvider sit above <App/> (and therefore
              above the router) so the running timer and focus-mode state survive
              navigating between pages instead of resetting. */}
          <TimerProvider>
            <FocusModeProvider>
              <App />
            </FocusModeProvider>
          </TimerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

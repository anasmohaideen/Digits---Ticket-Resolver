import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastMessagesProvider } from '@freshworks/dew-components';
import App from './App';
import './styles/index.css';
/* The AI Design System (copied from the reference build): AI tokens, motion
   styles and the hover-motion provider its Ask AI parts need. */
import './dewai/styles/index.css';
import { HoverMotionProvider } from './dewai';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      {/* Toasts are portalled and outlive the screen that raises them, so the
          provider sits above the router rather than inside any one route. The
          Dashboard's Clone action is the first thing in the app to use it. */}
      <ToastMessagesProvider>
        <HoverMotionProvider>
          <App />
        </HoverMotionProvider>
      </ToastMessagesProvider>
    </HashRouter>
  </StrictMode>,
);

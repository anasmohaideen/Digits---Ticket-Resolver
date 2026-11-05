import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ToastMessagesProvider } from '@freshworks/dew-components';
import App from './App';
import './styles/index.css';
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

/* Scrollbars stay hidden until the user scrolls, then fade out again (see styles: [data-scrolling]). */
const scrollTimers = new WeakMap<Element, number>();
document.addEventListener(
  'scroll',
  (event) => {
    const target = event.target instanceof Element ? event.target : document.documentElement;
    target.setAttribute('data-scrolling', '');
    window.clearTimeout(scrollTimers.get(target));
    scrollTimers.set(target, window.setTimeout(() => target.removeAttribute('data-scrolling'), 900));
  },
  true
);

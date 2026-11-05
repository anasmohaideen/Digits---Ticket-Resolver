import { createContext, useContext } from 'react';

/**
 * Lets a link inside the Details tab switch the ticket's tab strip, which
 * lives a level above it. Absent outside Option 2, where links behave as they
 * always have.
 */
export const TabNavigationContext = createContext<{ openTab: (name: string) => void } | null>(null);

export const useTabNavigation = () => useContext(TabNavigationContext);

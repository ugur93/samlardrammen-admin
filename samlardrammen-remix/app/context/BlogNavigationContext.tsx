import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface BlogNavigationContextType {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    scrollPosition: number;
    setScrollPosition: (position: number) => void;
    resetNavigation: () => void;
}

const defaultState: BlogNavigationContextType = {
    activeCategory: 'all',
    setActiveCategory: () => {},
    scrollPosition: 0,
    setScrollPosition: () => {},
    resetNavigation: () => {},
};

const BlogNavigationContext = createContext<BlogNavigationContextType>(defaultState);

export const useBlogNavigation = () => useContext(BlogNavigationContext);

type BlogNavigationProviderProps = {
    children: ReactNode;
};

export const BlogNavigationProvider: React.FC<BlogNavigationProviderProps> = ({ children }) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [scrollPosition, setScrollPosition] = useState<number>(0);

    // Function to reset all navigation state
    const resetNavigation = () => {
        setActiveCategory('all');
        setScrollPosition(0);
    };

    return (
        <BlogNavigationContext.Provider
            value={{
                activeCategory,
                setActiveCategory,
                scrollPosition,
                setScrollPosition,
                resetNavigation,
            }}
        >
            {children}
        </BlogNavigationContext.Provider>
    );
};

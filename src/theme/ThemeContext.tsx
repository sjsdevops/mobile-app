import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors as baseColors } from './colors';

// Coordinator primary color: purple 300 = #4F20B6
const COORDINATOR_PRIMARY = {
    DEFAULT: '#4F20B6',
    10: '#F9F7FC',
    50: 'rgba(79, 32, 182, 0.10)',
    100: '#c9b3f0',
    200: '#7342de',
    300: '#4F20B6',
    400: '#341577',
    500: '#1f0c46',
    alpha: 'rgba(79, 32, 182, 0.10)',
};

// Student primary color: #009C3E
const STUDENT_PRIMARY = {
    DEFAULT: '#009C3E',
    10: '#F0F8FC',
    50: 'rgba(0, 147, 206, 0.10)',
    100: '#99d6f0',
    200: '#33aedd',
    300: '#009C3E',
    400: '#0075a5',
    500: '#005478',
    alpha: 'rgba(0, 147, 206, 0.10)',
};

type ColorsType = typeof baseColors;

const ThemeContext = createContext<ColorsType>(baseColors);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const themeColors = useMemo<ColorsType>(() => {
        const role = (user?.role ?? '').toLowerCase();
        if (role === 'coordinator' || role === 'co-oridinator' || role.includes('coordinator') || role.includes('oridinator')) {
            return { ...baseColors, primary: COORDINATOR_PRIMARY } as ColorsType;
        }
        if (role === 'student') {
            return { ...baseColors, primary: STUDENT_PRIMARY } as ColorsType;
        }
        return baseColors;
    }, [user?.role]);

    return (
        <ThemeContext.Provider value={themeColors}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeColors(): ColorsType {
    return useContext(ThemeContext);
}

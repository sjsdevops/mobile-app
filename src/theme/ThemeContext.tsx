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

// Student primary color: #00E35A
const STUDENT_PRIMARY = {
    DEFAULT: '#00E35A',
    10: '#F0FFF6',
    50: 'rgba(0, 227, 90, 0.10)',
    100: '#99f5c2',
    200: '#33eb85',
    300: '#00E35A',
    400: '#00b347',
    500: '#008033',
    alpha: 'rgba(0, 227, 90, 0.10)',
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

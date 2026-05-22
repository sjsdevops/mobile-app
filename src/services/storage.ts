import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser, RolePermission } from '../types/auth';

const KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    CURRENT_USER: 'current_user',
    PERMISSIONS: 'user_permissions',
    TOKEN_EXPIRES_AT: 'token_expires_at',
};

// ─── Token ────────────────────────────────────────────────────────────────────

export async function saveAuthToken(token: string, expiresInSeconds = 3600): Promise<void> {
    const expiresAt = (Date.now() + expiresInSeconds * 1000).toString();
    await AsyncStorage.multiSet([
        [KEYS.AUTH_TOKEN, token],
        [KEYS.TOKEN_EXPIRES_AT, expiresAt],
    ]);
}

export async function getAuthToken(): Promise<string | null> {
    const [[, token], [, expiresAt]] = await AsyncStorage.multiGet([
        KEYS.AUTH_TOKEN,
        KEYS.TOKEN_EXPIRES_AT,
    ]);

    if (!token) return null;

    // Check expiry
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        await clearAuthData();
        return null;
    }

    return token;
}

export async function saveRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function saveUser(user: AuthUser): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function getUser(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function savePermissions(permissions: RolePermission[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.PERMISSIONS, JSON.stringify(permissions));
}

export async function getPermissions(): Promise<RolePermission[]> {
    const raw = await AsyncStorage.getItem(KEYS.PERMISSIONS);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as RolePermission[];
    } catch {
        return [];
    }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export async function clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
        KEYS.AUTH_TOKEN,
        KEYS.REFRESH_TOKEN,
        KEYS.CURRENT_USER,
        KEYS.PERMISSIONS,
        KEYS.TOKEN_EXPIRES_AT,
    ]);
}

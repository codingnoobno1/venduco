'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import apiRequest, { ApiError } from '@/lib/api';

export interface UiRoute {
  path: string;
  label: string;
  icon: string;
  requiredPermissions: string[];
  allowedRoles: string[];
  sortOrder: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string | null;
  permissions: string[];
  uiRoutes: UiRoute[];
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiRequest<{
        id: string; email: string; fullName: string; role: string;
        organizationId: string | null; permissions: string[];
        dynamicUiRoutes: UiRoute[];
      }>('/auth/me');

      setUser({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        organizationId: data.organizationId,
        permissions: data.permissions,
        uiRoutes: data.dynamicUiRoutes,
      });
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null); // Not authenticated
      } else {
        setError('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
    [user]
  );

  const hasAnyPermission = useCallback(
    (...permissions: string[]) => permissions.some(p => user?.permissions.includes(p)),
    [user]
  );

  const hasRole = useCallback(
    (role: string) => user?.role === role,
    [user]
  );

  const logout = useCallback(async () => {
    await apiRequest<any>('/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      hasPermission, hasAnyPermission, hasRole,
      logout, refreshProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

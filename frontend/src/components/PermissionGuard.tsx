'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  /** Render children only if the user has this permission */
  permission?: string;
  /** Render children only if the user has ANY of these permissions */
  anyPermission?: string[];
  /** Render children only if the user has this role */
  role?: string;
  /** What to show when access is denied (defaults to nothing) */
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission, anyPermission, role, fallback = null, children
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasRole, loading } = useAuth();

  if (loading) return null;

  if (permission && !hasPermission(permission)) return <>{fallback}</>;
  if (anyPermission && !hasAnyPermission(...anyPermission)) return <>{fallback}</>;
  if (role && !hasRole(role)) return <>{fallback}</>;

  return <>{children}</>;
}

import { NextRequest, NextResponse } from 'next/server';

const legacyDestinations: Record<string, Record<string, string>> = {
  ADMIN: { dashboard: '/dashboard/admin', projects: '/dashboard/admin/projects', resources: '/dashboard/admin/machines', reports: '/dashboard/admin/reports', users: '/dashboard/admin/users' },
  PROJECT_HEAD: { dashboard: '/dashboard/pm', projects: '/dashboard/pm/projects', tenders: '/dashboard/pm/bids', resources: '/dashboard/pm/materials', reports: '/dashboard/pm/reports', tasks: '/dashboard/pm/tasks', users: '/dashboard/pm/team', settings: '/dashboard/pm/settings' },
  EPC_MANAGER: { dashboard: '/dashboard/pm', projects: '/dashboard/pm/projects', tenders: '/dashboard/pm/bids', resources: '/dashboard/pm/materials', reports: '/dashboard/pm/reports', tasks: '/dashboard/pm/tasks', settings: '/dashboard/pm/settings' },
  SUPERVISOR: { dashboard: '/dashboard/supervisor', projects: '/dashboard/supervisor/projects', reports: '/dashboard/supervisor/reports', tasks: '/dashboard/supervisor/tasks', settings: '/dashboard/supervisor/settings' },
  VENDOR: { dashboard: '/dashboard/vendor', projects: '/dashboard/vendor', tenders: '/dashboard/vendor/bids', resources: '/dashboard/vendor/fleet', reports: '/dashboard/vendor/performance', tasks: '/dashboard/vendor/orders', invoices: '/dashboard/vendor/billing' },
  CONSULTANT: { dashboard: '/dashboard/consultant', tasks: '/dashboard/consultant', reports: '/dashboard/consultant' },
  CONTRACTOR: { dashboard: '/dashboard/contractor', projects: '/dashboard/contractor', reports: '/dashboard/contractor' },
  SUBCONTRACTOR: { dashboard: '/dashboard/subcontractor', tasks: '/dashboard/subcontractor', reports: '/dashboard/subcontractor' },
};

/** Reads an unverified role hint only to choose a UI redirect. Spring remains the authorization authority. */
function roleHintFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const claims = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof claims.role === 'string' ? claims.role : null;
  } catch {
    return null;
  }
}

function legacyRedirect(request: NextRequest, token: string) {
  const match = request.nextUrl.pathname.match(/^\/portal\/([^/]+)\/?$/);
  if (!match) return null;
  const role = roleHintFromToken(token);
  const destination = role ? legacyDestinations[role]?.[match[1]] : undefined;
  return NextResponse.redirect(new URL(destination || '/dashboard', request.url));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ['/login', '/register', '/'];
  const isPublic = publicPaths.some(path => pathname === path) || pathname.startsWith('/_next') || pathname.startsWith('/api/v1/auth');
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get('vc_token');
  if (!token?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return legacyRedirect(request, token.value) || NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

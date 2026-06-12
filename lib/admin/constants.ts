export const ADMIN_ROUTES = {
  ROOT: '/admin',
  LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/admin/forgot-password',
  UPDATE_PASSWORD: '/admin/update-password',
  SETTINGS: '/admin/settings',
  BUILDINGS: '/admin/buildings',
} as const;

const AUTH_PAGES = [
  ADMIN_ROUTES.LOGIN,
  ADMIN_ROUTES.FORGOT_PASSWORD,
  ADMIN_ROUTES.UPDATE_PASSWORD,
];

export function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}

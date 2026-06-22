"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Building2, Settings, LogOut } from 'lucide-react';

interface AdminNavProps {
  userEmail?: string | null;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  matchPaths?: string[]; // Additional paths that should show this as active
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/admin/buildings',
    label: 'Buildings',
    icon: Building2,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

/**
 * AdminNav - Responsive admin navigation.
 *
 * Both variants render in the DOM and are toggled with Tailwind's `md` breakpoint so the
 * correct one is present at first paint (no desktop→mobile flash on hydration):
 * - Phone (< md): fixed bottom navigation bar with icons.
 * - Tablet/Desktop (≥ md): top horizontal navigation bar.
 */
export function AdminNav({ userEmail, onLogout }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.matchPaths?.some(path => pathname.startsWith(path))) return true;
    return false;
  };

  return (
    <>
      {/* Phone: Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-brand-forest border-t border-[var(--color-border-strong)] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors
                  ${active
                    ? 'text-accent-gold'
                    : 'text-accent-beige/60 hover:text-accent-beige'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-accent-beige/60 hover:text-accent-beige"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Tablet/Desktop: Top Navigation */}
      <nav className="hidden md:block bg-brand-forest border-b border-[var(--color-border-strong)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-accent-beige/60 hover:text-accent-beige text-xs transition-colors flex items-center gap-1"
                title="View public site"
              >
                ← Site
              </Link>
              <div className="h-6 w-px bg-accent-beige/20"></div>
              <h1 className="text-xl font-heading font-bold text-accent-gold">
                Admin Panel
              </h1>
              {userEmail && (
                <span className="hidden md:inline text-sm text-accent-beige/60">
                  {userEmail}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {navItems.map((item) => {
                const active = isActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      text-sm transition-colors
                      ${active
                        ? 'text-accent-gold font-medium'
                        : 'text-accent-beige hover:text-accent-gold'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={onLogout}
                className="bg-accent-gold text-brand-forest px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

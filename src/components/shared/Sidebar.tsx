'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gem, FileText, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.GOLD_DISTRIBUTION, label: 'Gold Distribution', icon: Users },
  { href: ROUTES.JEWELLERY_COLLECTION, label: 'Jewellery Collection', icon: Gem },
  { href: ROUTES.REPORTS, label: 'Reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-[#4A3219] text-white hidden md:block print:hidden">
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-wider">
        JTS
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-700/50 text-white'
                  : 'text-stone-300 hover:bg-amber-900/30 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

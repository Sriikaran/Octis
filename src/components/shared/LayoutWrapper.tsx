'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageContainer } from './PageContainer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

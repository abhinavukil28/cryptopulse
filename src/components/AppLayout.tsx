import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar connectionStatus="live" alertCount={3} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
            {children}
          </div>
        </main>
        {/* Disclaimer */}
        <div className="disclaimer-bar px-4 lg:px-6 py-2 flex-shrink-0">
          <p className="text-2xs text-muted-foreground text-center">
            Market data and alerts are provided for informational purposes only and do not constitute financial or investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
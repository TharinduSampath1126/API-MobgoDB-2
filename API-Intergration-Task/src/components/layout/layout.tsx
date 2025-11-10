import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navbar/app-sidebar';

type LayoutProps = {
  children: ReactNode;
};

const MainContent = ({ children }: { children: ReactNode }) => {
  const { open, isMobile } = useSidebar();
  
  return (
    <SidebarInset 
      className="transition-all duration-300 ease-in-out"
      style={{
        marginLeft: !isMobile && open ? '11rem' : '4rem',
        width: !isMobile && open ? 'calc(100vw - 11rem)' : '100vw',
      }}
    >
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <div className="text-lg font-semibold">API Integration Task</div>
      </div>
      <main className="min-h-screen p-6">
        <div className="w-full max-w-full overflow-x-auto">
          {children}
        </div>
      </main>
    </SidebarInset>
  );
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
};

export default Layout;
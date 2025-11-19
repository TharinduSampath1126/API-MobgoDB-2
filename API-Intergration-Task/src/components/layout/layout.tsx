import type { ReactNode } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navbar/app-sidebar';
import { LayoutHeader } from './layout-header';
import { AuthStatusChecker } from '../auth/AuthStatusChecker';
import { useAuth } from '../../contexts/AuthContext';


type LayoutProps = {
  children: ReactNode;
};

const MainContent = ({ children }: { children: ReactNode }) => {
  const { open, isMobile } = useSidebar();
  const { logout } = useAuth();

  return (
    <SidebarInset
      className="transition-all duration-300 ease-in-out"
      style={{
        marginLeft: !isMobile && open ? '11rem' : '4rem',
        width: !isMobile && open ? 'calc(100vw - 11rem)' : '100vw',
      }}
    >
      <LayoutHeader />
      
      <main className="min-h-screen p-6">
        <div className="w-full max-w-full overflow-x-auto">{children}</div>
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

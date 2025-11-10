import {
  NavigationMenu,
  // NavigationMenuContent,
  // NavigationMenuIndicator,
  NavigationMenuItem,
  // NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuTrigger,
  // NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { useNavigate, useLocation } from 'react-router';

function navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <NavigationMenu className="h-15 w-full min-w-screen justify-start bg-gray-200">
      <NavigationMenuList className="ml-10 flex gap-5">
        <NavigationMenuItem
          onClick={() => navigate('/')}
          className={`cursor-pointer rounded-lg p-2 text-white ${location.pathname === '/' ? 'bg-gray-900' : 'bg-gray-500'} `}
          aria-current={location.pathname === '/' ? 'page' : undefined}
        >
            User Details
        </NavigationMenuItem>
        <NavigationMenuItem
          onClick={() => navigate('/newly-added')}
          className={`cursor-pointer rounded-lg p-2 text-white ${location.pathname.startsWith('/newly-added') ? 'bg-gray-900' : 'bg-gray-500'}`}
          aria-current={location.pathname.startsWith('/newly-added') ? 'page' : undefined}
        >
            Add Users
        </NavigationMenuItem>
        <NavigationMenuItem
          onClick={() => navigate('/admin')}
          className={`cursor-pointer rounded-lg p-2 text-white ${location.pathname.startsWith('/admin') ? 'bg-gray-900' : 'bg-gray-500'}`}
          aria-current={location.pathname.startsWith('/admin') ? 'page' : undefined}
        >
            Admin
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default navbar;

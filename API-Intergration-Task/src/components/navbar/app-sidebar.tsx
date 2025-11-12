import { BarChart3,  UserPlus,  ChevronLeft, Menu, Package } from "lucide-react"
import { useNavigate, useLocation } from 'react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

// Menu items to match the image
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Users Data",
    url: "/users",
    icon: UserPlus,
  },
  {
    title: "Products Data", 
    url: "/products",
    icon: Package,
  },
  
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarContent className="bg-slate-800 text-white">
        {/* Header with blue accent */}
        <SidebarHeader className="border-b border-slate-700 p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
        </SidebarHeader>

        {/* Navigation Menu */}
        <SidebarGroup className="flex-1 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3 py-4">
              {items.map((item) => {
                const isActive = item.url === '#' ? false : 
                  (item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url))
                const Icon = item.icon
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.url !== '#') {
                          navigate(item.url)
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                        hover:bg-slate-700 
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-300 hover:text-white'
                        }
                        ${isCollapsed ? 'justify-center px-2' : 'justify-start'}
                      `}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer with collapse button */}
        <SidebarFooter className="border-t border-slate-700 p-3">
          <SidebarMenuButton
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Collapse Sidebar</span>
              </>
            )}
          </SidebarMenuButton>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
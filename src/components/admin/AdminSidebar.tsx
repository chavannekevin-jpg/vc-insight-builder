import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  ListChecks,
  MessageSquare,
  BookOpen,
  Settings,
  DollarSign,
  Tag,
  Mail,
  Wrench,
  ChevronDown,
  ChevronRight,
  Shield,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Users Hub", url: "/admin/users", icon: Users },
  { title: "Investor Ecosystem", url: "/admin/investors", icon: Network },
];

const contentItems = [
  { title: "Sections", url: "/admin/sections", icon: ListChecks },
  { title: "Questions", url: "/admin/questions", icon: MessageSquare },
  { title: "Prompts", url: "/admin/prompts", icon: FileText },
  { title: "Articles", url: "/admin/articles", icon: BookOpen },
];

const commerceItems = [
  { title: "Pricing", url: "/admin/commerce", icon: DollarSign, exact: true },
  { title: "Discounts", url: "/admin/commerce/discounts", icon: Tag },
];

const toolItems = [
  { title: "Email Center", url: "/admin/emails", icon: Mail },
  { title: "Knowledge Base", url: "/admin/knowledge-base", icon: BookOpen },
  { title: "Analysis Builder", url: "/admin/analysis-builder", icon: Wrench },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [contentOpen, setContentOpen] = useState(
    contentItems.some((item) => location.pathname.startsWith(item.url))
  );
  const [commerceOpen, setCommerceOpen] = useState(
    location.pathname.startsWith("/admin/commerce")
  );
  const [toolsOpen, setToolsOpen] = useState(
    toolItems.some((item) => location.pathname.startsWith(item.url))
  );

  const isActive = (url: string, exact?: boolean) => {
    if (exact) return location.pathname === url;
    return location.pathname.startsWith(url);
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
        <NavLink to={item.url} className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const CollapsibleSection = ({
    title,
    items,
    open,
    onOpenChange,
    icon: Icon,
  }: {
    title: string;
    items: typeof contentItems;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    icon: React.ElementType;
  }) => (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{title}</span>}
            </div>
            {!collapsed && (
              open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Admin Header/Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground text-sm">UglyBaby</h2>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="pt-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Section */}
        <CollapsibleSection
          title="Content"
          items={contentItems}
          open={contentOpen}
          onOpenChange={setContentOpen}
          icon={FileText}
        />

        {/* Commerce Section */}
        <CollapsibleSection
          title="Commerce"
          items={commerceItems}
          open={commerceOpen}
          onOpenChange={setCommerceOpen}
          icon={DollarSign}
        />

        {/* Tools Section */}
        <CollapsibleSection
          title="Tools"
          items={toolItems}
          open={toolsOpen}
          onOpenChange={setToolsOpen}
          icon={Settings}
        />
      </SidebarContent>
    </Sidebar>
  );
}

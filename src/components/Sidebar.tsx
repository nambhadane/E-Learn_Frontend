import { NavLink } from "react-router-dom";
import { LucideIcon, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navItems: NavItem[];
  userType: "teacher" | "student";
  userName: string;
}

const Sidebar = ({ navItems, userType, userName }: SidebarProps) => {
  const navigate = useNavigate();
  // Always call useAuth (AuthProvider wraps the entire app)
  const authContext = useAuth();

  const handleLogout = () => {
    if (userType === "teacher") {
      // Use auth context logout for teachers
      authContext.logout();
    } else {
      // Fallback for student pages
      localStorage.clear();
      navigate("/");
    }
  };
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col shadow-sm">
      {/* Logo and branding */}
      <div className="p-6 space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">E-Learn Hub</h1>
            <p className="text-xs text-muted-foreground capitalize">{userType} Portal</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* User info */}
      <div className="px-6 py-4">
        <p className="text-sm text-muted-foreground">Welcome,</p>
        <p className="text-base font-semibold text-foreground">{userName}</p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-secondary"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

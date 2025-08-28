import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileInput, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    showSuccess("Successfully logged out");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/forms", label: "Forms", icon: <FileInput className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarOpen && (
            <Link to="/dashboard" className="text-xl font-bold text-primary whitespace-nowrap">
              Sugar & Insulin Tracker
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto rounded-full hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-600 hover:bg-gray-100",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
            >
              <span className={cn(sidebarOpen ? "mr-3" : "mr-0")}>
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center hover:bg-red-50 hover:text-red-600",
              sidebarOpen ? "justify-start" : "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", sidebarOpen ? "mr-3" : "mr-0")} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sugar & Insulin Tracker
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
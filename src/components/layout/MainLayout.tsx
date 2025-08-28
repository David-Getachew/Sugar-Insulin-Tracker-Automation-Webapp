import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileInput, 
  UserCircle, 
  LogOut
} from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="bg-[#115e59] flex flex-col w-20 sticky top-0 h-screen">
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-center px-2 py-4 text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? "bg-[#0d9488] text-white"
                  : "text-gray-200 hover:bg-[#0f766e]"
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span>{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        
        <div className="p-2 border-t border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center p-2 hover:bg-[#0f766e] text-gray-200 hover:text-white"
            onClick={handleLogout}
          >
            <div className="flex flex-col items-center">
              <LogOut className="h-5 w-5" />
              <span className="text-xs mt-1">Logout</span>
            </div>
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
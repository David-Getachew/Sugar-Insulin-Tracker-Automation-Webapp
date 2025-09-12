import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileInput, 
  UserCircle, 
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess } from "@/utils/toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("Successfully logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/forms", label: "Forms", icon: <FileInput className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">
      {/* Sidebar */}
      <div className="bg-[#115e59] flex flex-col w-20 sticky top-0 h-screen">
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center justify-center px-2 py-4 text-sm font-medium transition-colors duration-300
                ${location.pathname === item.path
                  ? "bg-[#0d9488] text-white"
                  : "text-white hover:bg-[#136d66]"
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
        
        <div className="p-2 border-t border-[#0d5c58]">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center p-2 hover:bg-[#136d66] text-red-400 hover:text-white transition-colors duration-300"
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
          <div className="container mx-auto px-4 text-center text-sm text-[#475569]">
            Built by Dawit Getachew — © 2025 Automation & Health Apps ·{' '}
            <a 
              href="https://github.com/David-Getachew" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0f766e] hover:underline"
            >
              GitHub
            </a>{' '}
            ·{' '}
            <a 
              href="https://www.linkedin.com/in/dawit-getachew-mekonen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0f766e] hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
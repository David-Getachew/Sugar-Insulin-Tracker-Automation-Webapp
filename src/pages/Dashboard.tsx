import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SugarLevelChart from "@/components/charts/SugarLevelChart";
import InsulinDoseChart from "@/components/charts/InsulinDoseChart";
import ReadingsTable from "@/components/tables/ReadingsTable";

const Dashboard = () => {
  // Mock user data - will be replaced with actual user data from Supabase
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });

  // Simulate loading user data
  useEffect(() => {
    // This would be a Supabase query in the real implementation
    const timer = setTimeout(() => {
      setUserData({
        name: "John Doe",
        email: "john.doe@example.com",
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {userData.name}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your sugar levels and insulin doses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SugarLevelChart />
          <InsulinDoseChart />
        </div>

        <div className="mt-8">
          <ReadingsTable />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
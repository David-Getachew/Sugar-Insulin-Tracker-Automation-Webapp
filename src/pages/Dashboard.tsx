import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SugarLevelChart from "@/components/charts/SugarLevelChart";
import InsulinDoseChart from "@/components/charts/InsulinDoseChart";
import ReadingsTable from "@/components/tables/ReadingsTable";

const Dashboard = () => {
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });

  useEffect(() => {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Welcome, {userData.name}</h1>
          <p className="text-[#475569]">
            Here's an overview of your sugar levels and insulin doses
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-[#0f766e]">Sugar Levels</h2>
            <SugarLevelChart />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-[#0f766e]">Insulin Doses</h2>
            <InsulinDoseChart />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#0f766e]">Readings History</h2>
          <ReadingsTable />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
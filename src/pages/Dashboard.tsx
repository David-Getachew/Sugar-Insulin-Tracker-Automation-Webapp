import MainLayout from "@/components/layout/MainLayout";
import SugarLevelChart from "@/components/charts/SugarLevelChart";
import DoseChart from "@/components/charts/DoseChart";
import ReadingsTable from "@/components/tables/ReadingsTable";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Dashboard</h1>
          <p className="text-[#475569]">
            Monitor your blood sugar levels, medication doses, and historical readings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SugarLevelChart />
          <DoseChart />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2 text-[#0f766e]">Readings History</h2>
          <p className="text-sm text-[#475569] mb-4">
            View your historical readings. Use filters to narrow down by date or date range. Sort by date using the sort button.
          </p>
          <ReadingsTable />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
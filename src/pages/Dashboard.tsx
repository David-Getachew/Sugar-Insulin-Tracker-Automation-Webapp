import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SugarLevelChart from "@/components/charts/SugarLevelChart";
import DoseChart from "@/components/charts/DoseChart";
import ReadingsTable from "@/components/tables/ReadingsTable";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import { DailyReading } from "@/types/database";

const Dashboard = () => {
  const { profile } = useAuth();
  const { getDailyReadings, loading } = useDatabase();
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isDemo = profile?.is_demo || false;

  // Memoize the data loading function to prevent unnecessary reruns
  const loadReadings = useCallback(async () => {
    try {
      const data = await getDailyReadings();
      setReadings(data);
    } catch (error) {
      console.error('Failed to load readings:', error);
      // Keep existing readings on error to prevent flickering
    } finally {
      setIsInitialLoad(false);
    }
  }, [getDailyReadings]);

  // Load data only once on component mount
  useEffect(() => {
    if (isInitialLoad) {
      loadReadings();
    }
  }, [loadReadings, isInitialLoad]);

  // Show loading only on initial load, not on subsequent data fetches
  if (loading && isInitialLoad) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f766e] mx-auto"></div>
            <p className="mt-4 text-[#475569]">Loading dashboard data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="space-y-6">
        {isDemo && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Account — Read-Only:</strong> You can view your actual data and test forms, but changes won't be saved permanently.
                </p>
              </div>
            </div>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Dashboard</h1>
          <p className="text-[#475569]">
            Monitor your blood sugar levels, medication doses, and historical readings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SugarLevelChart data={readings} />
          <DoseChart data={readings} />
        </div>
        
        <div>
          <ReadingsTable data={readings} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
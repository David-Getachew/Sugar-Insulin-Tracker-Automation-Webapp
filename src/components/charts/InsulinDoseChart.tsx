import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyReading } from "@/types/database";

interface InsulinDoseChartProps {
  data?: DailyReading[];
}

const InsulinDoseChart = ({ data = [] }: InsulinDoseChartProps) => {
  const [timeRange, setTimeRange] = useState("7");
  
  // Convert database data to chart format - no mock data
  const getChartData = () => {
    if (data.length > 0) {
      const days = parseInt(timeRange);
      const filteredData = data.slice(0, days);
      return filteredData.map(reading => ({
        date: new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        morningDose: reading.insulin_morning,
        nightDose: reading.insulin_night,
      }));
    }
    return [];
  };

  const chartData = getChartData();

  return (
    <Card className="w-full bg-white border border-[#e2e8f0]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-[#0f766e]">Insulin Doses</CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="14">14 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#475569" />
                <YAxis domain={[0, 20]} stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend />
                <Bar dataKey="morningDose" name="Morning Dose" fill="#0f766e" />
                <Bar dataKey="nightDose" name="Night Dose" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-[#94a3b8] mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-[#475569] font-medium">No insulin dose data yet</p>
              <p className="text-[#94a3b8] text-sm mt-1">Start tracking by adding daily readings</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsulinDoseChart;
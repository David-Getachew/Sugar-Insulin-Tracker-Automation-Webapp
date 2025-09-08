"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyReading } from "@/types/database";

interface ChartData {
  date: string;
  morning: number;
  evening: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    value: number;
    name: string;
  }>;
  label?: string;
}

interface DoseChartProps {
  data?: DailyReading[];
}

// Mock data for doses
const generateMockData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      morning: Math.floor(Math.random() * 10) + 5,
      evening: Math.floor(Math.random() * 10) + 5,
    });
  }
  
  return data;
};

const DoseChart = ({ data = [] }: DoseChartProps) => {
  const [timeRange, setTimeRange] = useState("30");
  
  // Convert database data to chart format or use mock data
  const getChartData = (): ChartData[] => {
    if (data.length > 0) {
      const days = parseInt(timeRange);
      const filteredData = data.slice(0, days);
      return filteredData.map(reading => ({
        date: reading.date,
        morning: reading.morning_dose,
        evening: reading.night_dose,
      }));
    }
    
    // Generate mock data when no real data is available
    return generateMockData(parseInt(timeRange));
  };
  
  const chartData = getChartData();
  
  // Custom tooltip to color the labels
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#e2e8f0] rounded-md shadow-md">
          <p className="font-medium text-[#0f172a]">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="flex items-center">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-[#475569]">
                {entry.name === 'morning' ? 'Morning Dose' : 'Evening Dose'}: 
              </span>
              <span className="font-medium ml-1">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="w-full bg-white border border-[#e2e8f0]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h3 className="text-lg font-medium text-[#0f766e]">Dose Tracking</h3>
          <p className="text-sm text-[#475569] mt-1">
            Monitor your medication doses over time. Adjust the time range to see historical data.
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[120px] border-[#cbd5e1]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingBottom: '10px' }}
                formatter={(value) => (
                  <span style={{ color: '#475569' }}>
                    {value === 'morning' ? 'Morning Dose' : 'Evening Dose'}
                  </span>
                )}
              />
              <Bar
                dataKey="morning"
                name="morning"
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="evening"
                name="evening"
                fill="#0f766e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoseChart;
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for sugar levels
const generateMockData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      morningSugar: Math.floor(Math.random() * 50) + 80, // Random between 80-130
      nightSugar: Math.floor(Math.random() * 60) + 90, // Random between 90-150
    });
  }
  
  return data;
};

const SugarLevelChart = () => {
  const [timeRange, setTimeRange] = useState("7");
  const data = generateMockData(parseInt(timeRange));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Sugar Levels</CardTitle>
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 200]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="morningSugar"
                name="Morning Sugar"
                stroke="#1386c1"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="nightSugar"
                name="Night Sugar"
                stroke="#0d9488"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SugarLevelChart;
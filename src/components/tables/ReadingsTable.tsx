import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths } from "date-fns";
import { Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Mock data for readings
const generateMockData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate some abnormal readings for demonstration
    const isAbnormal = Math.random() > 0.8; // 20% chance of abnormal reading
    
    data.push({
      id: i,
      date: date,
      morningSugar: isAbnormal 
        ? Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 200 : Math.floor(Math.random() * 30) + 50
        : Math.floor(Math.random() * 50) + 80,
      nightSugar: isAbnormal 
        ? Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 200 : Math.floor(Math.random() * 40) + 50
        : Math.floor(Math.random() * 60) + 90,
      morningDose: Math.floor(Math.random() * 5) + 10, // Random between 10-15
      nightDose: Math.floor(Math.random() * 5) + 8, // Random between 8-13
    });
  }
  
  return data;
};

const ReadingsTable = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Generate 100 days of mock data for pagination demo
  const allData = generateMockData(100);
  
  // Filter data based on selected date or date range
  const filteredData = dateRange?.from && dateRange?.to
    ? allData.filter(item => 
        item.date >= dateRange.from! && item.date <= dateRange.to!
      )
    : date 
    ? allData.filter(item => 
        item.date.getDate() === date.getDate() && 
        item.date.getMonth() === date.getMonth() && 
        item.date.getFullYear() === date.getFullYear()
      )
    : allData;
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  const clearFilters = () => {
    setDate(undefined);
    setDateRange(undefined);
    setCurrentPage(1);
  };

  // Function to check if a sugar level is abnormal
  const isAbnormalSugar = (value: number) => {
    return value < 70 || value > 180;
  };

  return (
    <Card className="w-full bg-white border border-[#e2e8f0]">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <CardTitle className="text-lg font-medium text-[#0f766e]">Readings History</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-[#475569]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange?.from && "text-[#475569]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Filter by range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {(date || dateRange?.from) && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-[#e2e8f0]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f9fafb]">
                <TableHead className="w-[120px] text-[#0f766e]">Date</TableHead>
                <TableHead className="text-[#0f766e]">Morning Sugar</TableHead>
                <TableHead className="text-[#0f766e]">Night Sugar</TableHead>
                <TableHead className="text-[#0f766e]">Morning Dose</TableHead>
                <TableHead className="text-[#0f766e]">Night Dose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((reading) => (
                  <TableRow key={reading.id} className="hover:bg-[#f0fdfa]">
                    <TableCell className="font-medium text-[#0f172a]">{format(reading.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={cn(
                          "data-number font-medium",
                          isAbnormalSugar(reading.morningSugar) ? "text-[#dc2626]" : "text-[#0f172a]"
                        )}>
                          {reading.morningSugar}
                        </span>
                        {isAbnormalSugar(reading.morningSugar) && (
                          <AlertTriangle className="h-4 w-4 text-[#dc2626] ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={cn(
                          "data-number font-medium",
                          isAbnormalSugar(reading.nightSugar) ? "text-[#dc2626]" : "text-[#0f172a]"
                        )}>
                          {reading.nightSugar}
                        </span>
                        {isAbnormalSugar(reading.nightSugar) && (
                          <AlertTriangle className="h-4 w-4 text-[#dc2626] ml-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="data-number text-[#0f172a] font-medium">
                        {reading.morningDose}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="data-number text-[#0f172a] font-medium">
                        {reading.nightDose}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-[#475569]">
                    No readings found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-[#475569]">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-[#0f172a]">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingsTable;
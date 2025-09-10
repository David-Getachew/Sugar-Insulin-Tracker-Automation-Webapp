import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, AlertTriangle, ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { DailyReading } from "@/types/database";

interface ReadingsTableProps {
  data?: DailyReading[];
}

// TableReading interface for local data manipulation
interface TableReading {
  id: string;
  date: Date;
  morningSugar: number;
  nightSugar: number;
  morningDose: number;
  nightDose: number;
}

const ReadingsTable = ({ data = [] }: ReadingsTableProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openDateRangePicker, setOpenDateRangePicker] = useState(false);
  const itemsPerPage = 7;
  
  // Convert database data to table format - no mock data
  const getTableData = (): TableReading[] => {
    if (data.length > 0) {
      return data.map(reading => ({
        id: reading.id,
        date: new Date(reading.date),
        morningSugar: reading.sugar_morning,
        nightSugar: reading.sugar_night,
        morningDose: reading.insulin_morning,
        nightDose: reading.insulin_night,
      }));
    }
    
    // Return empty array when no real data is available
    return [];
  };
  
  const allData = getTableData();
  
  // Reset other filter when one is selected
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setDateRange(undefined);
    setCurrentPage(1);
    // Reset sort order when filtering by specific date
    if (selectedDate) {
      setSortOrder("desc");
    }
    setOpenDatePicker(false); // Close the date picker after selection
  };
  
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    setDate(undefined);
    setCurrentPage(1);
    // Keep the picker open for range selection until both dates are selected
    if (range?.to) {
      setOpenDateRangePicker(false);
    }
  };
  
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
  
  // Sort data based on date (only when not filtering by specific date)
  const sortedData = [...filteredData].sort((a, b) => {
    // Don't sort when a specific date is selected
    if (date) return 0;
    
    return sortOrder === "asc" 
      ? a.date.getTime() - b.date.getTime()
      : b.date.getTime() - a.date.getTime();
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  
  const clearFilters = () => {
    setDate(undefined);
    setDateRange(undefined);
    setCurrentPage(1);
    setSortOrder("desc");
  };

  // Function to check if a sugar level is abnormal
  const isAbnormalSugar = (value: number) => {
    return value < 70 || value > 180;
  };

  // Toggle sort order (only available when not filtering by specific date)
  const toggleSortOrder = () => {
    if (!date) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setCurrentPage(1); // Reset to first page when sorting changes
    }
  };

  // Show sort button only when not filtering by specific date
  const showSortButton = !date;

  return (
    <Card className="w-full bg-white border border-[#e2e8f0]">
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#0f766e]">Readings History</h2>
          <p className="text-sm text-[#475569] mt-1">
            View your historical readings. Use filters to narrow down by date or date range. Sort by date using the sort button.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {showSortButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className={cn(
                  "border-[#cbd5e1]",
                  sortOrder !== "desc" && "bg-[#0f766e] text-white"
                )}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            )}
            
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant={date ? "default" : "outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-[#475569]",
                    date && "bg-[#0f766e] text-white hover:bg-[#0d5c58]"
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
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover open={openDateRangePicker} onOpenChange={setOpenDateRangePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant={dateRange?.from ? "default" : "outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange?.from && "text-[#475569]",
                    dateRange?.from && "bg-[#0f766e] text-white hover:bg-[#0d5c58]"
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
                  onSelect={handleDateRangeSelect}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {(date || dateRange?.from) && (
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                size="sm"
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
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
                    No data available yet — fill out the daily form to start seeing readings.
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
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
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
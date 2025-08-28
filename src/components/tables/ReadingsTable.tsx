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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Mock data for readings
const generateMockData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    data.push({
      id: i,
      date: date,
      morningSugar: Math.floor(Math.random() * 50) + 80, // Random between 80-130
      nightSugar: Math.floor(Math.random() * 60) + 90, // Random between 90-150
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
  const itemsPerPage = 7; // Changed to 7 items per page
  
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <CardTitle className="text-lg font-medium">Readings History</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
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
                  !dateRange?.from && "text-muted-foreground"
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Morning Sugar</TableHead>
                <TableHead>Night Sugar</TableHead>
                <TableHead>Morning Dose</TableHead>
                <TableHead>Night Dose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{format(reading.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{reading.morningSugar}</TableCell>
                    <TableCell>{reading.nightSugar}</TableCell>
                    <TableCell>{reading.morningDose}</TableCell>
                    <TableCell>{reading.nightDose}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
            <div className="text-sm text-muted-foreground">
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
              <div className="text-sm font-medium">
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
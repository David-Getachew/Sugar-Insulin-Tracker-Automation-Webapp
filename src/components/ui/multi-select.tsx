import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = React.forwardRef<
  HTMLDivElement,
  MultiSelectProps
>(({ options, selected, onChange, placeholder = "Select options...", className }, ref) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
      // Remove the last selected item
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)} ref={ref}>
      <div className="flex flex-wrap gap-1 p-1 border rounded-md min-h-10 bg-white border-[#cbd5e1] focus-within:ring-1 focus-within:ring-[#0f766e] focus-within:border-[#0f766e]">
        {selected.map((item) => (
          <Badge 
            key={item} 
            variant="secondary" 
            className="flex items-center gap-1 pl-2 pr-1 py-1 text-sm bg-[#0f766e] text-white"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-1 rounded-full hover:bg-[#0d5c58]"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 h-6"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search options..." />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div className={cn(
                          "mr-2 h-4 w-4 rounded-sm border",
                          selected.includes(option) ? "bg-[#0f766e] border-[#0f766e]" : "border-[#cbd5e1]"
                        )}>
                          {selected.includes(option) && (
                            <div className="h-4 w-4 flex items-center justify-center text-white">
                              ✓
                            </div>
                          )}
                        </div>
                        {option}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
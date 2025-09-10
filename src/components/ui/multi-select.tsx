import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

const pillColors = [
  "bg-[#0f766e] text-white",
  "bg-[#059669] text-white", 
  "bg-[#0891b2] text-white",
  "bg-[#7c3aed] text-white"
];

const MultiSelect = React.forwardRef<
  HTMLDivElement,
  MultiSelectProps
>(({ options, selected, onChange, placeholder = "Select options...", className }, ref) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && searchValue === "" && selected.length > 0) {
      // Remove the last selected item
      onChange(selected.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      setOpen(!open);
    }
  };

  const availableOptions = options.filter(option => 
    !selected.includes(option) && 
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div 
        className="flex flex-wrap gap-1 p-2 border rounded-md min-h-10 bg-white border-[#cbd5e1] focus-within:ring-1 focus-within:ring-[#0f766e] focus-within:border-[#0f766e] cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((item, index) => (
          <Badge 
            key={item} 
            className={cn(
              "flex items-center gap-1 pl-2 pr-1 py-1 text-sm",
              pillColors[index % pillColors.length]
            )}
          >
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item);
              }}
              className="ml-1 rounded-full hover:bg-black/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <div className="flex-1 flex items-center min-w-[120px]">
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-6 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </Button>
        </div>
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e2e8f0] rounded-md shadow-lg max-h-60 overflow-auto">
          {availableOptions.length > 0 ? (
            <div className="py-1">
              {availableOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[#f0fdfa] focus:bg-[#f0fdfa] focus:outline-none"
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-[#64748b]">
              {searchValue ? "No options found" : "All options selected"}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
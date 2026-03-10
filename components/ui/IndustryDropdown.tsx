"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown, Search } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants/industries";

interface IndustryDropdownProps {
  value: string[];
  onChange: (val: string[]) => void;
}

export function IndustryDropdown({ value, onChange }: IndustryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const filtered = INDUSTRIES.filter((ind) =>
    ind.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
      setHighlightedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const options = listboxRef.current.querySelectorAll('[role="option"]');
      options[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const toggleOption = useCallback(
    (ind: string) => {
      if (value.includes(ind)) {
        onChange(value.filter((v) => v !== ind));
      } else {
        onChange([...value, ind]);
      }
    },
    [onChange, value]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
            toggleOption(filtered[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setSearch("");
          setHighlightedIndex(-1);
          break;
      }
    },
    [open, filtered, highlightedIndex, toggleOption]
  );

  const listboxId = "industry-listbox";

  const displayText =
    value.length === 0
      ? ""
      : value.length <= 2
        ? value.join(", ")
        : `${value.slice(0, 2).join(", ")} +${value.length - 2}`;

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      <label className="font-kosugi text-caption-sm text-text-secondary uppercase tracking-widest mb-0.5 block">
        [industry]
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          "w-full flex items-center justify-between",
          "bg-background-input text-text-primary font-mohave text-body",
          "px-3 py-3 rounded-sm min-h-[48px]",
          "border border-border",
          "transition-all duration-150",
          "focus:border-ops-accent focus:outline-none",
          value.length === 0 && "text-text-tertiary"
        )}
      >
        <span className="truncate">{displayText || "Select industries"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-tertiary transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] font-mohave text-caption text-text-secondary"
            >
              {ind}
              <button
                type="button"
                onClick={() => toggleOption(ind)}
                className="text-text-disabled hover:text-text-primary transition-colors"
                aria-label={`Remove ${ind}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[rgba(10,10,10,0.70)] backdrop-blur-[20px] backdrop-saturate-[1.2] border border-[rgba(255,255,255,0.08)] rounded-sm overflow-hidden">
          <div className="p-1.5 border-b border-border">
            <div className="relative">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder="Search industries..."
                aria-label="Search industries"
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0 ? `industry-option-${highlightedIndex}` : undefined
                }
                className="w-full bg-background-input text-text-primary font-mohave text-body-sm pl-7 pr-2 py-1.5 rounded-sm border border-border focus:border-ops-accent focus:outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Industries"
            aria-multiselectable="true"
            className="max-h-[200px] overflow-y-auto"
          >
            {filtered.map((ind, index) => {
              const isSelected = value.includes(ind);
              return (
                <button
                  key={ind}
                  id={`industry-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(ind)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-left min-h-[44px]",
                    "font-mohave text-body-sm transition-colors",
                    isSelected
                      ? "bg-[rgba(255,255,255,0.08)] text-text-primary"
                      : highlightedIndex === index
                        ? "bg-background-elevated text-text-primary"
                        : "text-text-secondary hover:bg-background-elevated hover:text-text-primary"
                  )}
                >
                  <span>{ind}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-2 py-2 font-kosugi text-caption text-text-tertiary" role="status">
                No industries match &quot;{search}&quot;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

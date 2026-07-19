import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchableSelect({ label, value, placeholder, options, disabled, error, touched, onChange }: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  const openDropdown = () => {
    if (disabled) return;
    setQuery("");
    setOpen(true);
  };

  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-[#39566F]">{label}</span>
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={openDropdown}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 text-left text-sm text-[#102F4B] outline-none transition-all focus:ring-2 focus:ring-[#4F9FF0]/20 disabled:cursor-not-allowed disabled:bg-[#F8FCFF] disabled:text-[#8EA3B5]",
            touched && error ? "border-[#C94455]/60" : "border-[#D9ECFA]"
          )}
        >
          <span className={cn("truncate", !value && "text-[#8EA3B5]")}>{value || placeholder}</span>
          <ChevronDown size={16} className={cn("shrink-0 text-[#6C8398] transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-[#D9ECFA] bg-white shadow-[0_18px_45px_rgba(16,47,75,0.16)]">
            <div className="border-b border-[#EEF6FC] p-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C8398]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Escribe para buscar..."
                  className="h-10 w-full rounded-xl border border-[#D9ECFA] bg-[#F8FCFF] pl-9 pr-3 text-sm text-[#102F4B] outline-none focus:ring-2 focus:ring-[#4F9FF0]/20"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    option === value ? "bg-[#E8F0FE] font-semibold text-[#246FC1]" : "text-[#39566F] hover:bg-[#F8FCFF]"
                  )}
                >
                  {option}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-[#6C8398]">No se encontraron resultados.</div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && touched && <p className="text-[11px] font-medium text-[#C94455]">{error}</p>}
    </label>
  );
}

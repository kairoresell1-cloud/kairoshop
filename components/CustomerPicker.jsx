"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomerPicker({ value, onChange, placeholder = "Cerca cliente per nome o email..." }) {
  const [allCustomers, setAllCustomers] = useState([]);
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setAllCustomers(data);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const matches =
    query.trim().length === 0
      ? allCustomers.slice(0, 8)
      : allCustomers
          .filter((c) => {
            const q = query.toLowerCase();
            return (
              c.email.toLowerCase().includes(q) ||
              c.name?.toLowerCase().includes(q)
            );
          })
          .slice(0, 8);

  function selectCustomer(c) {
    onChange(c.email);
    setQuery(c.email);
    setOpen(false);
  }

  function handleInputChange(e) {
    const v = e.target.value;
    setQuery(v);
    onChange(v); // resta comunque modificabile a mano (es. cliente non ancora registrato)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input text-xs"
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto glass border border-kairo-sakura/15 shadow-glow">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[11px] text-white/30">
              Nessun cliente trovato — può essere comunque inserito a mano.
            </p>
          ) : (
            matches.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCustomer(c)}
                className="w-full text-left px-3 py-2.5 hover:bg-kairo-sakura/10 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs truncate">{c.name || "Senza nome"}</p>
                  <p className="text-[10px] text-white/40 truncate">{c.email}</p>
                </div>
                <span className="text-[9px] text-kairo-sakura/70 flex-shrink-0">
                  {c.ordersCount} ord.
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

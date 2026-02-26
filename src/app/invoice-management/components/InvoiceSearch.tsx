'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchSuggestion {
  id: string;
  type: 'invoice' | 'client';
  label: string;
  sublabel: string;
}

interface InvoiceSearchProps {
  onSearch: (query: string) => void;
}

const InvoiceSearch = ({ onSearch }: InvoiceSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const suggestions: SearchSuggestion[] = [
    { id: '1', type: 'invoice', label: 'INV-2026-001', sublabel: 'Acme Corporation - $5,250.00' },
    { id: '2', type: 'invoice', label: 'INV-2026-002', sublabel: 'Tech Solutions Inc - $3,800.00' },
    { id: '3', type: 'client', label: 'Acme Corporation', sublabel: '12 invoices' },
    { id: '4', type: 'client', label: 'Tech Solutions Inc', sublabel: '8 invoices' }
  ];

  const filteredSuggestions = searchQuery.length > 0
    ? suggestions.filter(s => 
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sublabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    onSearch(suggestion.label);
    setShowSuggestions(false);
  };

  if (!isHydrated) {
    return (
      <div className="relative mb-6">
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            className="w-full pl-12 pr-4 py-3 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth shadow-elevation-1"
            disabled
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
          <Icon name="MagnifyingGlassIcon" size={22} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
          placeholder="Search records by name, ID or amount..."
          className="w-full pl-14 pr-12 py-5 bg-card border border-divider rounded-2xl text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSearch('');
              setShowSuggestions(false);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-xl transition-all"
            aria-label="Clear search"
          >
            <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-divider rounded-2xl shadow-2xl py-3 z-20 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="px-5 py-2">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Matched Records</p>
            </div>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-5 py-4 text-left hover:bg-muted/50 transition-all flex items-center gap-4 border-b border-divider/50 last:border-0"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  suggestion.type === 'invoice' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                }`}>
                  <Icon
                    name={suggestion.type === 'invoice' ? 'DocumentTextIcon' : 'UserIcon'}
                    size={24}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{suggestion.label}</p>
                  <p className="text-[11px] text-muted-foreground font-medium truncate">{suggestion.sublabel}</p>
                </div>
                <div className="text-muted-foreground/30">
                  <Icon name="ChevronRightIcon" size={16} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceSearch;
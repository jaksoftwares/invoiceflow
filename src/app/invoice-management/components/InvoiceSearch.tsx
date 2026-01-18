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
    <div className="relative mb-6">
      <div className="relative">
        <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
          placeholder="Search by invoice number or client name..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth shadow-elevation-1"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              onSearch('');
              setShowSuggestions(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-smooth"
            aria-label="Clear search"
          >
            <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-elevation-3 py-2 z-20 max-h-80 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-smooth flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  suggestion.type === 'invoice' ? 'bg-primary/10' : 'bg-accent/10'
                }`}>
                  <Icon
                    name={suggestion.type === 'invoice' ? 'DocumentTextIcon' : 'UserIcon'}
                    size={18}
                    className={suggestion.type === 'invoice' ? 'text-primary' : 'text-accent'}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{suggestion.label}</p>
                  <p className="text-xs text-muted-foreground">{suggestion.sublabel}</p>
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
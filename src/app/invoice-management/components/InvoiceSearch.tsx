'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface InvoiceSearchProps {
 onSearch: (query: string) => void;
}

const InvoiceSearch = ({ onSearch }: InvoiceSearchProps) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [isHydrated, setIsHydrated] = useState(false);
 const debounceTimer = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 setIsHydrated(true);
 return () => {
 if (debounceTimer.current) clearTimeout(debounceTimer.current);
 };
 }, []);

 const handleSearchChange = (value: string) => {
 setSearchQuery(value);
 
 if (debounceTimer.current) {
 clearTimeout(debounceTimer.current);
 }

 debounceTimer.current = setTimeout(() => {
 onSearch(value);
 }, 400); // 400ms debounce
 };

 const handleClear = () => {
 setSearchQuery('');
 if (debounceTimer.current) clearTimeout(debounceTimer.current);
 onSearch('');
 };

 if (!isHydrated) {
 return (
 <div className="relative">
 <div className="relative">
 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30">
 <Icon name="MagnifyingGlassIcon" size={24} />
 </div>
 <input
 type="text"
 className="w-full pl-14 pr-12 py-5 bg-card border border-divider rounded-2xl text-base font-bold text-foreground focus:outline-none transition-all"
 disabled
 />
 </div>
 </div>
 );
 }

 return (
 <div className="relative group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
 <Icon name="MagnifyingGlassIcon" size={24} />
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => handleSearchChange(e.target.value)}
 placeholder="Enter Invoice ID, Client Name or Details..."
 className="w-full pl-16 pr-14 py-6 bg-card border border-divider rounded-3xl text-xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-elevation-1 group-hover:shadow-elevation-2"
 />
 {searchQuery && (
 <button
 onClick={handleClear}
 className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all"
 aria-label="Clear Search"
 >
 <Icon name="XMarkIcon" size={24} />
 </button>
 )}
 </div>
 );
};

export default InvoiceSearch;
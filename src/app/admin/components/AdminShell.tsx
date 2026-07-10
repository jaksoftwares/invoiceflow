'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminShellProps {
 children: React.ReactNode;
 user: { email: string; id: string };
}

const navGroups = [
 {
 label: 'Platform',
 items: [
 {
 label: 'Overview',
 href: '/admin',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
 </svg>
 ),
 },
 {
 label: 'Users',
 href: '/admin/users',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
 </svg>
 ),
 },
 {
 label: 'Analytics',
 href: '/admin/analytics',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
 </svg>
 ),
 },
 ],
 },
 {
 label: 'Commerce',
 items: [
 {
 label: 'Plans & Subs',
 href: '/admin/plans',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
 </svg>
 ),
 },
 {
 label: 'Invoices',
 href: '/admin/invoices',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 ),
 },
 {
 label: 'Templates',
 href: '/admin/templates',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
 </svg>
 ),
 },
 ],
 },
 {
 label: 'System',
 items: [
 {
 label: 'Settings',
 href: '/admin/settings',
 icon: (
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 ),
 },
 ],
 },
];

export default function AdminShell({ children, user }: AdminShellProps) {
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
 const pathname = usePathname();

 const isActive = (href: string) => {
 if (href === '/admin') return pathname === '/admin';
 return pathname.startsWith(href);
 };

 return (
 <div className="min-h-screen bg-[#0A0F1E] text-white flex">
 {/* Mobile overlay */}
 {mobileSidebarOpen && (
 <div
 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
 onClick={() => setMobileSidebarOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside
 className={`
 fixed top-0 left-0 h-full z-50 flex flex-col
 bg-gradient-to-b from-[#0D1526] to-[#0A0F1E]
 border-r border-white/[0.06]
 transition-all duration-300 ease-in-out
 ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
 `}
 >
 {/* Logo */}
 <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#D47C47] flex items-center justify-center flex-shrink-0 shadow-lg">
 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 {!sidebarCollapsed && (
 <div className="overflow-hidden">
 <p className="text-white font-semibold leading-tight text-sm">InvoiceFlow</p>
 <p className="text-[10px] text-amber-400/80 font-medium tracking-widest uppercase">Admin Panel</p>
 </div>
 )}
 </div>

 {/* Nav */}
 <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
 {navGroups.map(group => (
 <div key={group.label}>
 {!sidebarCollapsed && (
 <p className="px-3 pb-1 text-[10px] font-semibold text-white/20 font-medium">{group.label}</p>
 )}
 <div className="space-y-0.5">
 {group.items.map(item => (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => setMobileSidebarOpen(false)}
 className={`
 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
 transition-all duration-200 group relative
 ${isActive(item.href)
 ? 'bg-gradient-to-r from-[#1E3A5F] to-[#1a3354] text-white shadow-lg shadow-[#1E3A5F]/30'
 : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
 }
 `}
 title={sidebarCollapsed ? item.label : undefined}
 >
 <span className={`flex-shrink-0 ${isActive(item.href) ? 'text-amber-400' : ''}`}>
 {item.icon}
 </span>
 {!sidebarCollapsed && <span>{item.label}</span>}
 {isActive(item.href) && (
 <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-amber-400" />
 )}
 </Link>
 ))}
 </div>
 </div>
 ))}
 </nav>


 {/* Collapse button + user */}
 <div className="border-t border-white/[0.06] p-3 space-y-2">
 {/* Collapse toggle (desktop only) */}
 <button
 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
 className="hidden lg:flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-xs"
 >
 <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
 </svg>
 {!sidebarCollapsed && <span>Collapse</span>}
 </button>

 {/* User info */}
 <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.04] ${sidebarCollapsed ? 'justify-center' : ''}`}>
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D47C47] to-[#c26a35] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
 {user.email[0].toUpperCase()}
 </div>
 {!sidebarCollapsed && (
 <div className="overflow-hidden min-w-0">
 <p className="text-xs font-medium text-white truncate">{user.email}</p>
 <p className="text-[10px] text-white/40">Super Admin</p>
 </div>
 )}
 </div>

 {/* Back to app */}
 <Link
 href="/dashboard"
 className={`flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-xs ${sidebarCollapsed ? 'justify-center' : ''}`}
 title={sidebarCollapsed ? 'Back to App' : undefined}
 >
 <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 {!sidebarCollapsed && <span>Back to App</span>}
 </Link>
 </div>
 </aside>

 {/* Main */}
 <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
 {/* Top bar */}
 <header className="sticky top-0 z-30 bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
 <button
 onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
 className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06]"
 >
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
 </svg>
 </button>

 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
 <span className="text-xs text-white/50 font-medium">System Operational</span>
 </div>

 <div className="flex items-center gap-2 ml-auto">
 <span className="text-xs text-white/30 hidden sm:block">
 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
 </span>
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D47C47] to-[#c26a35] flex items-center justify-center text-white text-xs font-bold">
 {user.email[0].toUpperCase()}
 </div>
 </div>
 </header>

 {/* Page content */}
 <main className="flex-1 p-4 lg:p-6 xl:p-8">
 {children}
 </main>

 {/* Footer */}
 <footer className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between">
 <p className="text-xs text-white/20">InvoiceFlow Admin · {new Date().getFullYear()}</p>
 <p className="text-xs text-white/20">v1.0.0</p>
 </footer>
 </div>
 </div>
 );
}

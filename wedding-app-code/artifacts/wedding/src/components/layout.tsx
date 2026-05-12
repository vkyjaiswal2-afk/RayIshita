import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  CalendarHeart, 
  Map, 
  BellRing, 
  Users, 
  QrCode, 
  ShieldCheck,
  Menu,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/schedule", label: "Schedule", icon: CalendarHeart },
  { href: "/travel", label: "Travel & Map", icon: Map },
  { href: "/announcements", label: "Updates", icon: BellRing },
  { href: "/guests", label: "Guest List", icon: Users },
  { href: "/checkin", label: "Check-in", icon: QrCode },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={onClick}>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  // Don't wrap landing page in sidebar layout
  if (location === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 h-screen">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <Link href="/">
            <h1 className="font-serif text-2xl font-bold tracking-wider text-primary cursor-pointer">A & P</h1>
          </Link>
          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-8 h-8">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <NavLinks />
        </ScrollArea>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-background">
            <div className="p-6 border-b border-border/50">
              <h1 className="font-serif text-2xl font-bold tracking-wider text-primary">A & P</h1>
            </div>
            <ScrollArea className="h-full">
              <NavLinks onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        <h1 className="font-serif text-xl font-bold tracking-wider text-primary">A & P</h1>
        
        {mounted && (
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full p-4 md:p-8 max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/80 backdrop-blur-md pb-safe z-50">
        <div className="flex justify-around items-center p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg cursor-pointer ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'mb-1' : ''} transition-all`} />
                  {isActive && <span className="text-[10px] font-medium leading-none">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Simple wrapper for ScrollArea since we might not have it implemented in components/ui
function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`overflow-y-auto ${className}`}>{children}</div>;
}

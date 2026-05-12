import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetWedding, getGetWeddingQueryKey } from "@workspace/api-client-react";
import { MapPin, Calendar } from "lucide-react";

export default function Home() {
  const { data: wedding, isLoading } = useGetWedding();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!wedding?.weddingDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(wedding.weddingDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [wedding?.weddingDate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const gName = wedding?.groomName || "Arjun";
  const bName = wedding?.brideName || "Priya";
  const location = wedding?.city && wedding?.state ? `${wedding.city}, ${wedding.state}` : "Udaipur, Rajasthan";
  const dateStr = wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "December 15, 2024";

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        {wedding?.heroImageUrl ? (
          <img src={wedding.heroImageUrl} alt="Wedding Background" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        )}
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-6 max-w-4xl"
        >
          <h2 className="text-primary tracking-[0.3em] uppercase text-sm md:text-base font-medium">
            You are invited to celebrate
          </h2>
          
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-white drop-shadow-lg">
            {gName} <span className="text-primary italic">&</span> {bName}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mt-8 text-white/80 font-serif text-xl md:text-2xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{dateStr}</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-primary/50" />
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{location}</span>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto backdrop-blur-md bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex flex-col items-center">
                <span className="text-3xl md:text-5xl font-serif text-primary mb-1">{value}</span>
                <span className="text-xs md:text-sm uppercase tracking-widest text-white/60">{unit}</span>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg tracking-wide shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                Enter Guest Portal
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

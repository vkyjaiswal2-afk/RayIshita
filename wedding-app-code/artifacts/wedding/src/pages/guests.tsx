import React, { useState } from "react";
import { useListGuests, useListGroups, useCheckInGuest, useRsvpGuest, getListGuestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Train, Car, Navigation, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const transportIcon = (mode: string) => {
  switch (mode) {
    case "flight": return <Plane className="w-3.5 h-3.5" />;
    case "train": return <Train className="w-3.5 h-3.5" />;
    case "road": return <Car className="w-3.5 h-3.5" />;
    default: return <Navigation className="w-3.5 h-3.5" />;
  }
};

const rsvpConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-400 border-green-500/20", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending:   { label: "Pending",   className: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Clock className="w-3.5 h-3.5" /> },
  declined:  { label: "Declined",  className: "bg-red-500/10 text-red-400 border-red-500/20",       icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function Guests() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "checkedin">("all");
  const queryClient = useQueryClient();

  const { data: guests, isLoading } = useListGuests();
  const { data: groups } = useListGroups();
  const checkIn = useCheckInGuest();

  const groupMap = Object.fromEntries((groups || []).map(g => [g.id, g]));

  const filtered = (guests || []).filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase());
    if (filter === "confirmed") return matchesSearch && g.rsvpStatus === "confirmed";
    if (filter === "pending") return matchesSearch && g.rsvpStatus === "pending";
    if (filter === "checkedin") return matchesSearch && g.checkedIn;
    return matchesSearch;
  });

  const handleCheckIn = (id: number) => {
    checkIn.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() }),
    });
  };

  const stats = {
    total: guests?.length || 0,
    confirmed: guests?.filter(g => g.rsvpStatus === "confirmed").length || 0,
    checkedIn: guests?.filter(g => g.checkedIn).length || 0,
    pending: guests?.filter(g => g.rsvpStatus === "pending").length || 0,
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Guest List</h1>
        <p className="text-muted-foreground">All guests, their RSVP status, and check-in progress.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Checked In", value: stats.checkedIn },
          { label: "Pending", value: stats.pending },
        ].map(s => (
          <Card key={s.label} className="glass-panel">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-serif font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-guest-search"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "confirmed", "pending", "checkedin"] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(guest => {
            const cfg = rsvpConfig[guest.rsvpStatus] || rsvpConfig.pending;
            const group = guest.groupId ? groupMap[guest.groupId] : null;
            return (
              <Card key={guest.id} className="glass-panel" data-testid={`guest-card-${guest.id}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg shrink-0">
                    {guest.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{guest.name}</span>
                      {guest.checkedIn && (
                        <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Checked In
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        {transportIcon(guest.transportMode)}
                        <span className="capitalize">{guest.transportMode}</span>
                      </span>
                      <span>{guest.city}</span>
                      {group && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: group.color }} />
                          {group.name}
                        </span>
                      )}
                      {guest.dietaryReqs && <span>Diet: {guest.dietaryReqs}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                      <span className="mr-1">{cfg.icon}</span>
                      {cfg.label}
                    </Badge>
                    {!guest.checkedIn && guest.rsvpStatus === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => handleCheckIn(guest.id)}
                        disabled={checkIn.isPending}
                        data-testid={`button-checkin-${guest.id}`}
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
              <p className="font-serif text-lg">No guests found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

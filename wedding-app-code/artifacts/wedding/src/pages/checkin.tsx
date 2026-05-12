import React, { useState } from "react";
import { useListGuests, useCheckInGuest, getListGuestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Search, QrCode, PartyPopper } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Checkin() {
  const [search, setSearch] = useState("");
  const [justCheckedIn, setJustCheckedIn] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: guests, isLoading } = useListGuests();
  const checkIn = useCheckInGuest();

  const filtered = (guests || []).filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  const handleCheckIn = (id: number) => {
    checkIn.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        setJustCheckedIn(id);
        setTimeout(() => setJustCheckedIn(null), 3000);
      },
    });
  };

  const checkedInCount = guests?.filter(g => g.checkedIn).length || 0;
  const totalConfirmed = guests?.filter(g => g.rsvpStatus === "confirmed").length || 0;

  return (
    <div className="space-y-8 pb-20 max-w-xl mx-auto">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Guest Check-In</h1>
        <p className="text-muted-foreground">Search for a guest to check them in at the venue.</p>
      </div>

      <Card className="glass-panel border-primary/20">
        <CardContent className="p-6 text-center space-y-2">
          <div className="text-4xl font-serif font-bold text-primary">{checkedInCount} / {totalConfirmed}</div>
          <div className="text-sm text-muted-foreground">Confirmed guests checked in</div>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: totalConfirmed > 0 ? `${(checkedInCount / totalConfirmed) * 100}%` : "0%" }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-checkin-search"
          autoFocus
        />
      </div>

      {justCheckedIn && (
        <Card className="glass-panel border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3 text-green-400">
            <PartyPopper className="w-5 h-5 shrink-0" />
            <span className="font-medium">
              {guests?.find(g => g.id === justCheckedIn)?.name} has been checked in!
            </span>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : search.length > 0 ? (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="font-serif">No guests found</p>
              <p className="text-sm mt-1">Try searching by name or phone number.</p>
            </div>
          )}
          {filtered.map(guest => (
            <Card key={guest.id} className="glass-panel" data-testid={`checkin-guest-${guest.id}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg shrink-0">
                  {guest.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{guest.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{guest.city} · {guest.phone}</div>
                </div>
                {guest.checkedIn ? (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                  </Badge>
                ) : guest.rsvpStatus === "confirmed" ? (
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleCheckIn(guest.id)}
                    disabled={checkIn.isPending}
                    data-testid={`button-checkin-${guest.id}`}
                  >
                    Check In
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-xs capitalize">{guest.rsvpStatus}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground/40 border border-dashed border-border/50 rounded-2xl">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-lg text-muted-foreground">Start typing to search guests</p>
        </div>
      )}
    </div>
  );
}

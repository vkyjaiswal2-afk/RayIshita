import React from "react";
import { useListVenues, useGetWedding } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Globe, Star, Hotel, Utensils, Landmark, Train, Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ceremony:      { label: "Ceremony",       icon: <Star className="w-4 h-4" />,     color: "bg-primary/10 text-primary border-primary/20" },
  reception:     { label: "Reception",      icon: <Star className="w-4 h-4" />,     color: "bg-primary/10 text-primary border-primary/20" },
  hotel:         { label: "Hotel",          icon: <Hotel className="w-4 h-4" />,    color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  restaurant:    { label: "Restaurant",     icon: <Utensils className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  attraction:    { label: "Attraction",     icon: <Landmark className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  transport_hub: { label: "Transport Hub",  icon: <Train className="w-4 h-4" />,    color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

const groupOrder = ["ceremony", "reception", "hotel", "restaurant", "attraction", "transport_hub"];
const groupLabels: Record<string, string> = {
  ceremony: "Wedding Venue",
  reception: "Reception Venue",
  hotel: "Recommended Hotels",
  restaurant: "Dining",
  attraction: "Explore Udaipur",
  transport_hub: "Getting Here",
};

export default function Guide() {
  const { data: venues, isLoading } = useListVenues();
  const { data: wedding } = useGetWedding();

  const grouped = venues?.reduce((acc: Record<string, typeof venues>, v) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Destination Guide</h1>
        <p className="text-muted-foreground">Everything you need to know about Udaipur — the City of Lakes.</p>
      </div>

      {wedding?.emergencyContact && (
        <Card className="glass-panel border-red-500/20 bg-red-500/5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">Emergency Contact</p>
              <p className="text-sm text-muted-foreground">
                Family coordinator: <span className="font-semibold text-foreground">{wedding.emergencyContact}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(j => <Skeleton key={j} className="h-40 w-full rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {groupOrder.map(type => {
            const items = grouped?.[type];
            if (!items || items.length === 0) return null;
            const cfg = typeConfig[type] || typeConfig.ceremony;
            return (
              <div key={type} className="space-y-4">
                <h2 className="text-xl font-serif font-bold flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.color}`}>
                    {cfg.icon}
                  </span>
                  {groupLabels[type] || type}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(venue => (
                    <Card key={venue.id} className={`glass-panel ${venue.isRecommended ? 'border-primary/30' : ''}`} data-testid={`venue-${venue.id}`}>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-lg font-semibold">{venue.name}</h3>
                          {venue.isRecommended && (
                            <Badge variant="outline" className="text-xs shrink-0 bg-primary/10 text-primary border-primary/20">
                              <Star className="w-3 h-3 mr-1" /> Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{venue.description}</p>
                        <div className="space-y-1.5 pt-1 text-sm text-foreground/70">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/60" />
                            <span>{venue.address}</span>
                          </div>
                          {venue.distanceFromVenue && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="pl-6">{venue.distanceFromVenue}</span>
                            </div>
                          )}
                          {venue.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-primary/60" />
                              <a href={`tel:${venue.phone}`} className="hover:text-primary transition-colors" data-testid={`venue-phone-${venue.id}`}>{venue.phone}</a>
                            </div>
                          )}
                        </div>
                        {venue.mapUrl && (
                          <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" data-testid={`venue-map-${venue.id}`}>
                            <Button variant="outline" size="sm" className="w-full mt-2 gap-2 text-xs">
                              <ExternalLink className="w-3.5 h-3.5" /> Open in Maps
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useListGroups, getListGroupsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Train, Car, Navigation, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'arrived': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'en_route': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'delayed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'arrived': return 'Arrived';
    case 'en_route': return 'En Route';
    case 'delayed': return 'Delayed';
    default: return 'Not Departed';
  }
};

const getTransportIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'flight': return <Plane className="w-5 h-5" />;
    case 'train': return <Train className="w-5 h-5" />;
    case 'road': return <Car className="w-5 h-5" />;
    default: return <Navigation className="w-5 h-5" />;
  }
};

export default function Travel() {
  const { data: groups, isLoading } = useListGroups({ query: { refetchInterval: 30000, queryKey: getListGroupsQueryKey() } });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Travel Status</h1>
        <p className="text-muted-foreground">Live tracking of all guest groups arriving for the wedding.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="glass-panel"><CardContent className="p-6 space-y-4"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <Card key={group.id} className="glass-panel overflow-hidden border-t-4" style={{ borderTopColor: group.color || 'hsl(var(--primary))' }}>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" /> From {group.fromCity}
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(group.status)}>
                    {getStatusLabel(group.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Transport</span>
                    <div className="flex items-center gap-2 font-medium">
                      {getTransportIcon(group.transportMode)}
                      <span className="capitalize">{group.transportMode}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Guests</span>
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{group.guestCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {group.departureTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Departure</span>
                      <span className="font-medium">{format(new Date(group.departureTime), 'MMM d, h:mm a')}</span>
                    </div>
                  )}
                  {group.etaMinutes !== null && group.etaMinutes !== undefined && group.status === 'en_route' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Navigation className="w-3.5 h-3.5"/> ETA</span>
                      <span className="font-medium text-primary">{group.etaMinutes} mins</span>
                    </div>
                  )}
                  {group.currentLocation && group.status !== 'arrived' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Location</span>
                      <span className="font-medium truncate max-w-[120px]" title={group.currentLocation}>{group.currentLocation}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {groups?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
              No travel groups configured yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

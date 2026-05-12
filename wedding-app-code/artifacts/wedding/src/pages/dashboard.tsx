import React from "react";
import { useGetDashboardStats, useListAnnouncements, useListEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, Car, Train, Clock, Users, MapPin, Bell } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: announcements, isLoading: announcementsLoading } = useListAnnouncements();
  const { data: events, isLoading: eventsLoading } = useListEvents();

  const pinnedAnnouncements = announcements?.filter(a => a.isPinned) || [];
  const upcomingEvents = events?.filter(e => new Date(e.startTime) > new Date()).slice(0, 3) || [];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Welcome to Udaipur</h1>
        <p className="text-muted-foreground">Your personal guide to Arjun & Priya's wedding celebration.</p>
      </div>

      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-medium flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Important Updates
          </h2>
          <div className="grid gap-4">
            {pinnedAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="bg-primary/5 border-primary/20 shadow-none">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-full mt-1">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                    <span className="text-xs text-muted-foreground/60 mt-2 block">
                      {format(new Date(announcement.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-serif font-bold text-primary">{stats?.totalGuests || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-serif font-bold text-primary">{stats?.checkedInGuests || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Groups Arrived</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-serif font-bold text-primary">{stats?.arrivedGroups || 0} / {stats?.totalGroups || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Route</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-serif font-bold text-primary">{stats?.arrivingGroups || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-medium">Upcoming Events</h2>
          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="glass-panel overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <CardContent className="p-4 pl-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{format(new Date(event.startTime), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary">
                        {event.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-muted-foreground p-8 text-center border rounded-xl border-dashed">No upcoming events found.</div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-serif font-medium">Transport Overview</h2>
          <Card className="glass-panel">
            <CardContent className="p-6">
              {statsLoading ? (
                 <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                     <div className="flex items-center gap-3">
                       <Plane className="w-5 h-5 text-primary" />
                       <span className="font-medium">Flights</span>
                     </div>
                     <span className="text-lg font-serif">{stats?.byTransportMode?.flight || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                     <div className="flex items-center gap-3">
                       <Train className="w-5 h-5 text-primary" />
                       <span className="font-medium">Trains</span>
                     </div>
                     <span className="text-lg font-serif">{stats?.byTransportMode?.train || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                     <div className="flex items-center gap-3">
                       <Car className="w-5 h-5 text-primary" />
                       <span className="font-medium">Road</span>
                     </div>
                     <span className="text-lg font-serif">{stats?.byTransportMode?.road || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

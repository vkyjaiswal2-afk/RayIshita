import React from "react";
import { useListEvents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MapPin, Clock, Info, Utensils, Music, Car, Bed, Star } from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'ceremony': return <Star className="w-4 h-4" />;
    case 'reception': return <Music className="w-4 h-4" />;
    case 'food': return <Utensils className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'accommodation': return <Bed className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export default function Schedule() {
  const { data: events, isLoading } = useListEvents();

  // Group events by day
  const groupedEvents = events?.reduce((acc: Record<string, typeof events>, event) => {
    const day = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {});

  const sortedDays = groupedEvents ? Object.keys(groupedEvents).sort() : [];

  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2 text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-foreground">The Schedule</h1>
        <p className="text-muted-foreground">Order of events for the celebration.</p>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-40" />
              {[1, 2, 3].map(j => <Skeleton key={j} className="h-32 w-full" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDays.map((day) => {
            const dayEvents = groupedEvents?.[day] || [];
            
            return (
              <div key={day} className="relative">
                <div className="sticky top-16 md:top-4 z-10 bg-background/90 backdrop-blur-md py-4 mb-6">
                  <h2 className="text-2xl font-serif font-bold text-primary border-b border-primary/20 pb-2 inline-block">
                    {format(new Date(day), 'EEEE, MMMM do')}
                  </h2>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
                  {dayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((event, i) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative left-0 md:left-1/2 -translate-x-1/2">
                        {getCategoryIcon(event.category)}
                      </div>
                      
                      {/* Event Card */}
                      <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass-panel border-l-4 ${event.isHighlight ? 'border-l-primary shadow-lg shadow-primary/10' : 'border-l-transparent'}`}>
                        <CardContent className="p-5 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif text-xl font-semibold">{event.title}</h3>
                            <div className="text-sm font-medium text-primary whitespace-nowrap bg-primary/10 px-2 py-1 rounded-md">
                              {format(new Date(event.startTime), 'h:mm a')}
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          
                          <div className="grid gap-2 pt-2 text-sm">
                            <div className="flex items-center gap-2 text-foreground/80">
                              <MapPin className="w-4 h-4 text-primary/70" />
                              <span>{event.location}</span>
                            </div>
                            
                            {event.dresscode && (
                              <div className="flex items-center gap-2 text-foreground/80">
                                <Info className="w-4 h-4 text-primary/70" />
                                <span><span className="font-medium">Dress Code:</span> {event.dresscode}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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

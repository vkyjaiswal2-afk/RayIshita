import React from "react";
import { useListAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Pin, Trash2, MapPin, Bus, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  info:      { label: "Info",      icon: <Info className="w-4 h-4" />,          className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  alert:     { label: "Alert",     icon: <AlertTriangle className="w-4 h-4" />,  className: "bg-red-500/10 text-red-400 border-red-500/20" },
  success:   { label: "Update",    icon: <CheckCircle className="w-4 h-4" />,    className: "bg-green-500/10 text-green-400 border-green-500/20" },
  transport: { label: "Transport", icon: <Bus className="w-4 h-4" />,            className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  location:  { label: "Location",  icon: <MapPin className="w-4 h-4" />,         className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

export default function Announcements() {
  const { data: announcements, isLoading } = useListAnnouncements({
    query: { refetchInterval: 30000, queryKey: getListAnnouncementsQueryKey() },
  });

  const pinned = announcements?.filter(a => a.isPinned) || [];
  const regular = announcements?.filter(a => !a.isPinned) || [];

  return (
    <div className="space-y-8 pb-20 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">Updates</h1>
        <p className="text-muted-foreground">All announcements and live updates for guests.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {pinned.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary flex items-center gap-2">
                <Pin className="w-4 h-4" /> Pinned
              </h2>
              {pinned.map(a => {
                const cfg = typeConfig[a.type] || typeConfig.info;
                return (
                  <Card key={a.id} className="glass-panel border-primary/30 shadow-primary/10 shadow-lg" data-testid={`announcement-pinned-${a.id}`}>
                    <CardContent className="p-5 flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.className.split(' ').slice(0,2).join(' ')}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground">{a.title}</h3>
                          <Badge variant="outline" className={`shrink-0 text-xs ${cfg.className}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{a.message}</p>
                        <span className="text-xs text-muted-foreground/50 mt-2 block">
                          {format(new Date(a.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {regular.length > 0 && (
            <div className="space-y-4">
              {pinned.length > 0 && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">All Updates</h2>
              )}
              {regular.map(a => {
                const cfg = typeConfig[a.type] || typeConfig.info;
                return (
                  <Card key={a.id} className="glass-panel" data-testid={`announcement-${a.id}`}>
                    <CardContent className="p-5 flex gap-4">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${cfg.className.split(' ').slice(0,2).join(' ')}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{a.title}</h3>
                          <Badge variant="outline" className={`shrink-0 text-xs ${cfg.className}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{a.message}</p>
                        <span className="text-xs text-muted-foreground/50 mt-2 block">
                          {format(new Date(a.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {announcements?.length === 0 && (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-serif text-xl">No announcements yet</p>
              <p className="text-sm mt-1">Check back soon for updates from the wedding team.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

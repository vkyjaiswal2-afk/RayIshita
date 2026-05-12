import React, { useState } from "react";
import {
  useCreateAnnouncement, useDeleteAnnouncement,
  useListAnnouncements, useListGroups, useUpdateGroup,
  useListEvents, useUpdateEvent,
  getListAnnouncementsQueryKey, getListGroupsQueryKey, getListEventsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Bell, Bus, Calendar, Trash2, Plus, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PIN = "admin123";

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState("info");
  const [announcementPinned, setAnnouncementPinned] = useState(false);

  const queryClient = useQueryClient();

  const { data: announcements } = useListAnnouncements();
  const { data: groups } = useListGroups();
  const { data: events } = useListEvents();

  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const updateGroup = useUpdateGroup();
  const updateEvent = useUpdateEvent();

  const handleUnlock = () => {
    if (pinInput === PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handlePostAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    createAnnouncement.mutate(
      { data: { title: announcementTitle, message: announcementMessage, type: announcementType, isPinned: announcementPinned } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
          setAnnouncementTitle("");
          setAnnouncementMessage("");
          setAnnouncementPinned(false);
        },
      }
    );
  };

  const handleDeleteAnnouncement = (id: number) => {
    deleteAnnouncement.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() }),
    });
  };

  const handleGroupStatusUpdate = (id: number, status: string) => {
    updateGroup.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() }),
    });
  };

  const handleGroupLocationUpdate = (id: number, currentLocation: string) => {
    updateGroup.mutate({ id, data: { currentLocation } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() }),
    });
  };

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-panel w-full max-w-sm">
          <CardContent className="p-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold">Admin Access</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your admin PIN to continue</p>
            </div>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                className={pinError ? "border-red-500" : ""}
                data-testid="input-admin-pin"
              />
              {pinError && <p className="text-xs text-red-400">Incorrect PIN. Please try again.</p>}
              <Button className="w-full" onClick={handleUnlock} data-testid="button-unlock-admin">
                <ShieldCheck className="w-4 h-4 mr-2" /> Unlock Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage announcements, travel status, and events in real time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Announcement */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" /> Post Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Announcement title"
              value={announcementTitle}
              onChange={e => setAnnouncementTitle(e.target.value)}
              data-testid="input-announcement-title"
            />
            <Textarea
              placeholder="Your message to guests..."
              value={announcementMessage}
              onChange={e => setAnnouncementMessage(e.target.value)}
              rows={3}
              data-testid="input-announcement-message"
            />
            <div className="flex gap-2">
              <Select value={announcementType} onValueChange={setAnnouncementType}>
                <SelectTrigger className="flex-1" data-testid="select-announcement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Update</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={announcementPinned ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setAnnouncementPinned(p => !p)}
                data-testid="button-toggle-pin"
              >
                Pin
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={handlePostAnnouncement}
              disabled={createAnnouncement.isPending || !announcementTitle.trim() || !announcementMessage.trim()}
              data-testid="button-post-announcement"
            >
              <Plus className="w-4 h-4 mr-2" /> Post Announcement
            </Button>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" /> Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {(announcements || []).slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/40 group" data-testid={`admin-announcement-${a.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(a.createdAt), "MMM d, h:mm a")}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  data-testid={`button-delete-announcement-${a.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            {(!announcements || announcements.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Travel Group Status */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Bus className="w-5 h-5 text-primary" /> Update Travel Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(groups || []).map(group => (
              <div key={group.id} className="p-3 rounded-lg bg-background/40 space-y-2" data-testid={`admin-group-${group.id}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: group.color }} />
                    {group.name}
                  </span>
                  <Select
                    value={group.status}
                    onValueChange={val => handleGroupStatusUpdate(group.id, val)}
                  >
                    <SelectTrigger className="w-36 h-7 text-xs" data-testid={`select-group-status-${group.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_departed">Not Departed</SelectItem>
                      <SelectItem value="en_route">En Route</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Current location..."
                    defaultValue={group.currentLocation || ""}
                    className="h-7 text-xs"
                    onBlur={e => {
                      if (e.target.value !== (group.currentLocation || "")) {
                        handleGroupLocationUpdate(group.id, e.target.value);
                      }
                    }}
                    data-testid={`input-group-location-${group.id}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Event Schedule */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" /> Event Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {(events || []).map(event => (
              <div key={event.id} className="p-3 rounded-lg bg-background/40 space-y-1.5" data-testid={`admin-event-${event.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{event.title}</span>
                  <Badge variant="outline" className="text-xs shrink-0 capitalize">{event.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    defaultValue={event.startTime.slice(0, 16)}
                    className="h-7 text-xs"
                    onBlur={e => {
                      const newTime = new Date(e.target.value).toISOString();
                      if (newTime !== event.startTime) {
                        updateEvent.mutate({ id: event.id, data: { startTime: newTime } }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() }),
                        });
                      }
                    }}
                    data-testid={`input-event-time-${event.id}`}
                  />
                  <Input
                    placeholder="Location..."
                    defaultValue={event.location}
                    className="h-7 text-xs"
                    onBlur={e => {
                      if (e.target.value !== event.location) {
                        updateEvent.mutate({ id: event.id, data: { location: e.target.value } }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() }),
                        });
                      }
                    }}
                    data-testid={`input-event-location-${event.id}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

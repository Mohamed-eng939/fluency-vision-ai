import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck, Volume2, VolumeX } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  data: any;
  read_at: string | null;
  created_at: string;
}

const SOUND_KEY = 'upedia_notif_sound';

const timeAgo = (iso: string): string => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/** Short, pleasant two-note chime via the Web Audio API (no asset needed). */
function playChime() {
  try {
    const AC: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const ping = (freq: number, start: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.start(t);
      o.stop(t + 0.34);
    };
    // resume() helps when the context starts suspended (autoplay policy).
    (ctx.resume?.() ?? Promise.resolve()).finally(() => {
      ping(880, 0);      // A5
      ping(1174.7, 0.13); // D6
      setTimeout(() => ctx.close().catch(() => {}), 700);
    });
  } catch {
    /* audio unavailable / blocked — silent */
  }
}

/**
 * Facebook-style in-app notification bell. Reads the current user's rows from
 * the notifications table (RLS scopes to the owner), polls every 30s, marks
 * them read, and plays a chime when a new notification arrives (so Testers and
 * Sales Agents are alerted even if they aren't looking at the bell). The sound
 * can be muted; the preference persists per browser.
 */
const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
  });
  const prevUnread = useRef<number | null>(null);
  const soundRef = useRef(soundOn);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    const rows = (data as Notification[]) ?? [];
    const unreadNow = rows.filter((n) => !n.read_at).length;
    // Chime only when the unread count has grown since the last check (not on
    // first load), so a genuinely new notification alerts the user.
    if (prevUnread.current !== null && unreadNow > prevUnread.current && soundRef.current) {
      playChime();
    }
    prevUnread.current = unreadNow;
    setItems(rows);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const unread = items.filter((n) => !n.read_at).length;

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* ignore */ }
      if (next) playChime(); // confirm it's on + unlock audio on this gesture
      return next;
    });
  };

  const markAllRead = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    setItems((list) => list.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    prevUnread.current = 0;
    await supabase.from('notifications').update({ read_at: now }).is('read_at', null).eq('user_id', user.id);
  };

  const markOne = async (id: string) => {
    const now = new Date().toISOString();
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? now } : n)));
    await supabase.from('notifications').update({ read_at: now }).eq('id', id).is('read_at', null);
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={toggleSound}
              title={soundOn ? 'Sound on — click to mute' : 'Sound off — click to enable'}
              aria-label={soundOn ? 'Mute notification sound' : 'Enable notification sound'}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </Button>
            {unread > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  className={`cursor-pointer px-3 py-2.5 text-sm hover:bg-muted/50 ${n.read_at ? '' : 'bg-blue-50/60'}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                    <div className={n.read_at ? 'pl-4' : ''}>
                      <p className="font-medium leading-tight">{n.title || 'Notification'}</p>
                      {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

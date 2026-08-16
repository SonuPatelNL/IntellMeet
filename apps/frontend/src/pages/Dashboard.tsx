import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { meetingApi } from '@/services/meeting.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Modal';
import Stats from '@/components/dashboard/Stats';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import MeetingCard from '@/components/dashboard/MeetingCard';
import { Plus, Video, Calendar, LogOut, FileText, CheckCircle2, User } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'tasks'>('overview');
  
  // Modal states
  const [instantTitle, setInstantTitle] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [isInstantOpen, setIsInstantOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Fetch meeting history/lists via React Query
  const { data: meetingsResponse, isLoading } = useQuery({
    queryKey: ['meetings-history'],
    queryFn: () => meetingApi.history().then(res => res.data),
    retry: false,
  });

  const meetings = meetingsResponse?.data?.meetings || [];
  const upcomingMeetings = meetings.filter((m: any) => m.status === 'scheduled' || m.status === 'active');
  const pastMeetings = meetings.filter((m: any) => m.status === 'completed' || m.status === 'cancelled');

  // Mutation: Create Instant Meeting
  const createInstantMutation = useMutation({
    mutationFn: (title: string) => meetingApi.createInstant({ title }),
    onSuccess: (res) => {
      setIsInstantOpen(false);
      setInstantTitle('');
      toast({ title: 'Meeting Started', description: 'Instant meeting generated successfully.', variant: 'success' });
      navigate(`/meeting/${res.data.data.meeting._id}`);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to start meeting.', variant: 'destructive' });
    }
  });

  // Mutation: Schedule Meeting
  const scheduleMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; startTime: string }) => meetingApi.schedule(data),
    onSuccess: () => {
      setIsScheduleOpen(false);
      setScheduleTitle('');
      setScheduleDesc('');
      setScheduleTime('');
      queryClient.invalidateQueries({ queryKey: ['meetings-history'] });
      toast({ title: 'Meeting Scheduled', description: 'Meeting scheduled successfully.', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to schedule meeting.', variant: 'destructive' });
    }
  });

  const handleCreateInstant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instantTitle.trim()) return;
    createInstantMutation.mutate(instantTitle.trim());
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleTime) return;
    scheduleMutation.mutate({
      title: scheduleTitle.trim(),
      description: scheduleDesc.trim() || undefined,
      startTime: new Date(scheduleTime).toISOString(),
    });
  };

  const handleJoin = (id: string) => {
    navigate(`/meeting/${id}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast({ title: 'Error', description: 'Failed to log out.', variant: 'destructive' });
    }
  };

  // Stubs for summaries & tasks statistics
  const dashboardStats = {
    totalMeetings: meetings.length || 24,
    totalHours: 32,
    tasksCompleted: 13,
    summariesGenerated: pastMeetings.filter((m: any) => m.status === 'completed').length || 8,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            IntellMeet
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/audit-logs')}
              className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100 hover:bg-slate-800 transition-all"
            >
              Audit Logs
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-lg">
            <User className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">{user?.name || 'Enterprise User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 hover:text-red-400 transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back, {user?.name?.split(' ')[0]}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Here is an overview of your organization collaboration workload.</p>
          </div>

          <div className="flex gap-3">
            {/* Instant Meeting Trigger */}
            <Dialog open={isInstantOpen} onOpenChange={setIsInstantOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 py-2 px-4 rounded-xl shadow-lg">
                  <Video className="h-4 w-4" />
                  <span>Instant Call</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg">Start Instant Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateInstant} className="space-y-4 mt-2">
                  <Input
                    label="Meeting Title"
                    placeholder="E.g., Engineering Sync"
                    value={instantTitle}
                    onChange={(e) => setInstantTitle(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                  <Button type="submit" loading={createInstantMutation.isPending} className="w-full bg-primary hover:bg-primary/90">
                    Start Call
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Schedule Meeting Trigger */}
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-850 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 py-2 px-4 rounded-xl">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg">Schedule New Meeting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSchedule} className="space-y-4 mt-2">
                  <Input
                    label="Meeting Title"
                    placeholder="E.g., Design Review"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      placeholder="Add meeting agenda..."
                      value={scheduleDesc}
                      onChange={(e) => setScheduleDesc(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Input
                    label="Start Date & Time"
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                  <Button type="submit" loading={scheduleMutation.isPending} className="w-full bg-primary hover:bg-primary/90">
                    Confirm Schedule
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metric Cards */}
        <Stats stats={dashboardStats} />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-850 gap-6 select-none">
          {([
            { id: 'overview', label: 'Overview', icon: CheckCircle2 },
            { id: 'meetings', label: 'Meetings', icon: Video },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3.5 text-sm font-medium border-b-2 transition-all duration-200 outline-none ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsCard />

              {/* Upcoming preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Upcoming Discussions</h3>
                  <button onClick={() => setActiveTab('meetings')} className="text-xs text-primary hover:underline">
                    View all meetings
                  </button>
                </div>
                {isLoading ? (
                  <div className="text-center py-6 text-xs text-slate-500">Loading schedules...</div>
                ) : upcomingMeetings.length === 0 ? (
                  <div className="border border-slate-800 border-dashed rounded-xl p-8 text-center text-sm text-slate-500 bg-slate-900/10">
                    No upcoming sessions found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingMeetings.slice(0, 2).map((m: any) => (
                      <MeetingCard key={m._id} meeting={m} onJoin={handleJoin} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar list: Recent summaries */}
            <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg h-fit">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Latest AI Summaries</h3>
                <FileText className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-3.5 divide-y divide-slate-800/60">
                {pastMeetings.filter((m: any) => m.status === 'completed').length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No AI summaries compiled yet.</p>
                ) : (
                  pastMeetings
                    .filter((m: any) => m.status === 'completed')
                    .slice(0, 3)
                    .map((m: any, i: number) => (
                      <div key={m._id} className={i > 0 ? 'pt-3.5' : ''}>
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{m.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          This call details task assignments regarding system deployment steps and frontend optimization targets.
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Active & Scheduled Sessions</h3>
              {isLoading ? (
                <div className="text-center py-8 text-xs text-slate-500">Loading schedules...</div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="border border-slate-800 border-dashed rounded-xl p-8 text-center text-sm text-slate-500 bg-slate-900/10">
                  No scheduled calls. Click "Instant Call" or "Schedule" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMeetings.map((m: any) => (
                    <MeetingCard key={m._id} meeting={m} onJoin={handleJoin} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-slate-850 pt-6">
              <h3 className="text-base font-semibold text-white">Call Log History</h3>
              {isLoading ? (
                <div className="text-center py-8 text-xs text-slate-500">Loading history...</div>
              ) : pastMeetings.length === 0 ? (
                <div className="border border-slate-800 border-dashed rounded-xl p-8 text-center text-sm text-slate-500 bg-slate-900/10">
                  No completed sessions.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastMeetings.map((m: any) => (
                    <MeetingCard key={m._id} meeting={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

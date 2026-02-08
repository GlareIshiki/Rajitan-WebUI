"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";

// ======================================================================
// Types
// ======================================================================

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  eventType: string;
  sourceId?: string;
  color?: string;
  isAllDay: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  color: string;
  isAllDay: boolean;
}

// ======================================================================
// Constants
// ======================================================================

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  deadline: { label: "締切", color: "#ef4444", dotColor: "bg-red-500" },
  schedule: { label: "スケジュール", color: "#3b82f6", dotColor: "bg-blue-500" },
  manual: { label: "イベント", color: "#a855f7", dotColor: "bg-purple-500" },
};

const DEFAULT_FORM: EventFormData = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  color: "#a855f7",
  isAllDay: false,
};

// ======================================================================
// Helpers
// ======================================================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMonthLabel(year: number, month: number): string {
  return `${year}年 ${month + 1}月`;
}

function toDateKey(isoString: string): string {
  // Extract YYYY-MM-DD from ISO string
  return isoString.slice(0, 10);
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function toLocalISOString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
}

// ======================================================================
// Component
// ======================================================================

export default function CalendarPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, router]);

  // Fetch events for current month
  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const fromDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      const lastDay = getDaysInMonth(currentYear, currentMonth);
      const toDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59`;
      const data = await api.get<CalendarEvent[]>(
        `/api/calendar/events?from_date=${fromDate}&to_date=${toDate}`,
        token,
      );
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentYear, currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const key = toDateKey(event.startTime);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [events]);

  // Events for selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[selectedDate] || [];
  }, [selectedDate, eventsByDate]);

  // Calendar grid data
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    const cells: Array<{
      day: number | null;
      dateKey: string;
      isToday: boolean;
      events: CalendarEvent[];
    }> = [];

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateKey: "", isToday: false, events: [] });
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDate(currentYear, currentMonth, day);
      cells.push({
        day,
        dateKey,
        isToday: dateKey === todayStr,
        events: eventsByDate[dateKey] || [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, eventsByDate]);

  // Month navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatDate(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  // Day click
  const handleDayClick = (dateKey: string) => {
    setSelectedDate(dateKey === selectedDate ? null : dateKey);
    setShowCreateForm(false);
    setEditingEvent(null);
  };

  // Create event
  const openCreateForm = () => {
    const defaultStart = selectedDate
      ? `${selectedDate}T09:00`
      : toLocalISOString(new Date());
    setForm({
      ...DEFAULT_FORM,
      startTime: defaultStart,
    });
    setEditingEvent(null);
    setShowCreateForm(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      description: event.description || "",
      startTime: event.startTime.slice(0, 16),
      endTime: event.endTime?.slice(0, 16) || "",
      color: event.color || "#a855f7",
      isAllDay: event.isAllDay,
    });
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    if (!token || !form.title.trim()) return;
    setSaving(true);
    try {
      if (editingEvent) {
        await api.put(
          `/api/calendar/events/${editingEvent.id}`,
          {
            title: form.title,
            description: form.description || null,
            startTime: form.startTime,
            endTime: form.endTime || null,
            color: form.color,
            isAllDay: form.isAllDay,
          },
          token,
        );
      } else {
        await api.post(
          "/api/calendar/events",
          {
            title: form.title,
            description: form.description || null,
            startTime: form.startTime,
            endTime: form.endTime || null,
            color: form.color,
            isAllDay: form.isAllDay,
          },
          token,
        );
      }
      setShowCreateForm(false);
      setEditingEvent(null);
      setForm(DEFAULT_FORM);
      await fetchEvents();
    } catch (err) {
      console.error("Failed to save event:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!token) return;
    try {
      await api.delete(`/api/calendar/events/${eventId}`, token);
      setShowCreateForm(false);
      setEditingEvent(null);
      await fetchEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // Loading / auth states
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📅</div>
          <div className="text-muted">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-app text-primary p-4 sm:p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">📅</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-accent">
                カレンダー
              </h1>
            </div>
            <p className="text-sm text-muted">
              締切・スケジュール・イベントを一覧で管理
            </p>
          </div>
          <button onClick={openCreateForm} className="btn-primary text-sm">
            + イベント作成
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* カレンダーグリッド */}
          <div className="lg:col-span-2">
            <div className="card p-4 sm:p-6">
              {/* 月ナビゲーション */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-lg hover:bg-panel transition-colors text-muted hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">
                    {formatMonthLabel(currentYear, currentMonth)}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-xs px-3 py-1 rounded-full bg-panel text-muted hover:text-primary transition-colors"
                  >
                    今日
                  </button>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-panel transition-colors text-muted hover:text-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-medium py-2 ${
                      i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-px bg-panel rounded-lg overflow-hidden">
                {calendarGrid.map((cell, i) => {
                  if (cell.day === null) {
                    return (
                      <div
                        key={`empty-${i}`}
                        className="min-h-[80px] sm:min-h-[100px] bg-app/50 p-1"
                      />
                    );
                  }

                  const dayOfWeek = new Date(currentYear, currentMonth, cell.day).getDay();
                  const isSelected = cell.dateKey === selectedDate;
                  const hasEvents = cell.events.length > 0;

                  return (
                    <button
                      key={cell.dateKey}
                      onClick={() => handleDayClick(cell.dateKey)}
                      className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 text-left transition-all relative ${
                        isSelected
                          ? "bg-accent/10 ring-2 ring-accent ring-inset"
                          : "hover:bg-panel/80"
                      } ${cell.isToday ? "" : "bg-app/30"}`}
                      style={cell.isToday ? { backgroundColor: "var(--mode-bg-card)" } : undefined}
                    >
                      {/* 日付番号 */}
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-medium ${
                          cell.isToday
                            ? "bg-accent text-white"
                            : dayOfWeek === 0
                              ? "text-red-400"
                              : dayOfWeek === 6
                                ? "text-blue-400"
                                : "text-primary"
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* イベントドット */}
                      {hasEvents && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {cell.events.slice(0, 3).map((event) => {
                            const config = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.manual;
                            return (
                              <div
                                key={event.id}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`}
                                />
                                <span className="text-[10px] sm:text-xs truncate text-muted">
                                  {event.title}
                                </span>
                              </div>
                            );
                          })}
                          {cell.events.length > 3 && (
                            <span className="text-[10px] text-muted">
                              +{cell.events.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ローディング */}
              {loading && (
                <div className="mt-4 text-center text-sm text-muted">
                  読み込み中...
                </div>
              )}

              {/* 凡例 */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
                {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                    <span>{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドパネル */}
          <div className="lg:col-span-1 space-y-4">
            {/* イベント作成/編集フォーム */}
            {showCreateForm && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    {editingEvent ? "イベント編集" : "イベント作成"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingEvent(null);
                    }}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-panel border border-panel text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="イベント名"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      説明
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-panel border border-panel text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      rows={2}
                      placeholder="メモ（任意）"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAllDay"
                      checked={form.isAllDay}
                      onChange={(e) => setForm({ ...form, isAllDay: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isAllDay" className="text-sm text-muted">
                      終日
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      開始日時
                    </label>
                    <input
                      type={form.isAllDay ? "date" : "datetime-local"}
                      value={form.isAllDay ? form.startTime.slice(0, 10) : form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-panel border border-panel text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {!form.isAllDay && (
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">
                        終了日時（任意）
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-panel border border-panel text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      カラー
                    </label>
                    <div className="flex gap-2">
                      {["#a855f7", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => setForm({ ...form, color: c })}
                            className={`w-7 h-7 rounded-full transition-all ${
                              form.color === c
                                ? "ring-2 ring-offset-2 ring-accent scale-110"
                                : "hover:scale-105"
                            }`}
                            style={{
                              backgroundColor: c,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.title.trim()}
                      className="flex-1 btn-primary text-sm disabled:opacity-50"
                    >
                      {saving ? "保存中..." : editingEvent ? "更新" : "作成"}
                    </button>
                    {editingEvent && (
                      <button
                        onClick={() => handleDelete(editingEvent.id)}
                        className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 選択日のイベント一覧 */}
            {selectedDate && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    {selectedDate.replace(/-/g, "/")}
                  </h3>
                  <span className="text-xs text-muted">
                    {selectedEvents.length}件
                  </span>
                </div>

                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-muted py-4 text-center">
                    この日のイベントはありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((event) => {
                      const config = EVENT_TYPE_CONFIG[event.eventType] || EVENT_TYPE_CONFIG.manual;
                      const isManual = event.eventType === "manual";

                      return (
                        <div
                          key={event.id}
                          className="group p-3 rounded-lg bg-panel hover:bg-panel/80 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-1 h-full min-h-[20px] rounded-full flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: event.color || config.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {event.title}
                                </span>
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: `${config.color}20`,
                                    color: config.color,
                                  }}
                                >
                                  {config.label}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-xs text-muted mt-0.5 truncate">
                                  {event.description}
                                </p>
                              )}
                              {!event.isAllDay && formatTime(event.startTime) && (
                                <p className="text-xs text-muted mt-0.5">
                                  {formatTime(event.startTime)}
                                  {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                                </p>
                              )}
                              {event.isAllDay && (
                                <p className="text-xs text-muted mt-0.5">終日</p>
                              )}
                            </div>
                            {isManual && (
                              <button
                                onClick={() => openEditForm(event)}
                                className="opacity-0 group-hover:opacity-100 text-xs text-muted hover:text-primary transition-all flex-shrink-0"
                              >
                                編集
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={openCreateForm}
                  className="mt-3 w-full py-2 rounded-lg border border-dashed border-panel text-sm text-muted hover:text-primary hover:border-accent transition-colors"
                >
                  + この日にイベント追加
                </button>
              </div>
            )}

            {/* 選択日がない場合 */}
            {!selectedDate && !showCreateForm && (
              <div className="card p-6 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm text-muted">
                  日付をクリックすると
                  <br />
                  イベントが表示されます
                </p>
              </div>
            )}

            {/* 今月のイベントサマリー */}
            <div className="card p-4">
              <h3 className="font-bold mb-3">今月のサマリー</h3>
              <div className="space-y-2">
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
                  const count = events.filter((e) => e.eventType === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                        <span className="text-muted">{config.label}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-panel flex items-center justify-between text-sm">
                  <span className="text-muted">合計</span>
                  <span className="font-bold">{events.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

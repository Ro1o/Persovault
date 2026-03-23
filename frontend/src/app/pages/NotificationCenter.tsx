import { useState } from "react";
import { Bell, AlertTriangle, TrendingDown, Info, FileText, CheckCircle, Eye, X, Settings } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import type { Notification } from "../contexts/NotificationContext";

type NotificationType = "all" | "compliance" | "licence" | "system";

export function NotificationCenter() {

  // ── All state comes from shared context — Navbar reads same data ──
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    compliance: true,
    licence: true,
    system: true,
    behaviour: true,
    emailAlerts: false,
  });

  const filterNotifications = (notifs: Notification[]) => {
    if (activeFilter === "all") return notifs;
    if (activeFilter === "compliance") return notifs.filter(n => n.category === "compliance");
    if (activeFilter === "licence") return notifs.filter(n => n.category === "licence");
    if (activeFilter === "system") return notifs.filter(n => n.category === "system");
    return notifs;
  };

  const filteredNotifications = filterNotifications(notifications);

  const viewDetails = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "positive": return <TrendingDown className="w-5 h-5" />;
      case "info": return <Info className="w-5 h-5" />;
      case "system": return <FileText className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "warning":
        return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-900/30" };
      case "positive":
        return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-900/30" };
      case "info":
        return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-900/30" };
      case "system":
        return { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700" };
      default:
        return { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700" };
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notification Center</h1>
          <p className="text-muted-foreground">Stay updated with system alerts and notifications</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30">
            <span className="font-semibold">{unreadCount} Unread</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["all", "compliance", "licence", "system"] as NotificationType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {filter === "all" ? "All" : filter === "compliance" ? "Compliance Alerts" : filter === "licence" ? "Licence Updates" : "System Notifications"}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Feed */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card rounded-lg p-12 border border-border shadow-sm text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You don't have any notifications in this category.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-card rounded-lg p-6 border shadow-sm transition-all hover:shadow-md ${
                  notification.unread ? "border-gray-900 dark:border-white" : "border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${styles.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={styles.text}>{getNotificationIcon(notification.type)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {notification.title}
                          {notification.unread && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.timestamp}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${styles.border} border`}>
                        {notification.type === "warning" && "Warning"}
                        {notification.type === "positive" && "Positive"}
                        {notification.type === "info" && "Information"}
                        {notification.type === "system" && "System"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-4">{notification.description}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => viewDetails(notification)}
                        className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {notification.unread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-4 py-2 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-900 dark:border-white flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      {filteredNotifications.length > 0 && (
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Mark All as Read
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-900 dark:border-white flex items-center gap-2 justify-center"
            >
              <Settings className="w-5 h-5" />
              Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-xl shadow-2xl p-8 border border-border w-full max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${getNotificationStyles(selectedNotification.type).bg} rounded-lg flex items-center justify-center`}>
                  <div className={getNotificationStyles(selectedNotification.type).text}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedNotification.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedNotification.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-foreground leading-relaxed mb-6">{selectedNotification.details}</p>
            <button
              onClick={() => setSelectedNotification(null)}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-xl shadow-2xl p-8 border border-border w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Notification Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">Choose which notifications you want to receive:</p>
              {[
                { key: "compliance", label: "Compliance Alerts", desc: "Penalty points and suspension warnings" },
                { key: "licence", label: "Licence Updates", desc: "Renewal reminders and licence changes" },
                { key: "system", label: "System Notifications", desc: "Maintenance and system updates" },
                { key: "behaviour", label: "Behaviour Updates", desc: "Risk score changes and milestones" },
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive notifications via email" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings[key as keyof typeof settings] ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      settings[key as keyof typeof settings]
                        ? "left-7 bg-white dark:bg-gray-900"
                        : "left-1 bg-white dark:bg-gray-400"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 bg-white dark:bg-gray-950 text-gray-900 dark:text-white rounded-lg border border-gray-900 dark:border-white transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
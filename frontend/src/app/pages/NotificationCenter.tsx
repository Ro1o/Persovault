import { useState } from "react";
import { Bell, AlertTriangle, TrendingDown, Info, FileText, CheckCircle, Eye } from "lucide-react";

type NotificationType = "all" | "compliance" | "licence" | "system";

interface Notification {
  id: number;
  type: "warning" | "positive" | "info" | "system";
  category: "compliance" | "licence" | "system" | "behaviour";
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: "warning",
    category: "compliance",
    title: "Approaching Penalty Points Limit",
    description: "You currently have 8 out of 12 penalty points. Further violations may result in licence suspension.",
    timestamp: "13 Mar 2026 – 09:45",
    unread: true,
  },
  {
    id: 2,
    type: "positive",
    category: "behaviour",
    title: "Risk Score Improved",
    description: "Your suspension risk has decreased from 18% to 15%. Keep maintaining safe driving behaviour.",
    timestamp: "12 Mar 2026 – 14:20",
    unread: true,
  },
  {
    id: 3,
    type: "info",
    category: "licence",
    title: "Licence Renewal Reminder",
    description: "Your driving licence expires on 01 Jan 2034. Ensure renewal before expiry.",
    timestamp: "10 Mar 2026 – 08:00",
    unread: false,
  },
  {
    id: 4,
    type: "system",
    category: "system",
    title: "Behaviour Passport Generated",
    description: "Your digital behaviour passport has been successfully refreshed.",
    timestamp: "08 Mar 2026 – 11:30",
    unread: false,
  },
  {
    id: 5,
    type: "positive",
    category: "behaviour",
    title: "Clean Driving Milestone",
    description: "Congratulations! You've completed 145 days without any violations.",
    timestamp: "05 Mar 2026 – 10:15",
    unread: false,
  },
  {
    id: 6,
    type: "info",
    category: "system",
    title: "System Maintenance Notice",
    description: "PersoVault will undergo scheduled maintenance on 20 Mar 2026 from 02:00 to 04:00.",
    timestamp: "01 Mar 2026 – 16:00",
    unread: false,
  },
];

export function NotificationCenter() {
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all");

  const filterNotifications = (notifications: Notification[]) => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "compliance") return notifications.filter(n => n.category === "compliance");
    if (activeFilter === "licence") return notifications.filter(n => n.category === "licence");
    if (activeFilter === "system") return notifications.filter(n => n.category === "system");
    return notifications;
  };

  const filteredNotifications = filterNotifications(notifications);
  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "positive":
        return <TrendingDown className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      case "system":
        return <FileText className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-600 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-900/30",
        };
      case "positive":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-200 dark:border-green-900/30",
        };
      case "info":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-900/30",
        };
      case "system":
        return {
          bg: "bg-gray-100 dark:bg-gray-900",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-200 dark:border-gray-700",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-900",
          text: "text-gray-600 dark:text-gray-400",
          border: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Notification Center
          </h1>
          <p className="text-muted-foreground">
            Stay updated with system alerts and notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30">
            <span className="font-semibold">{unreadCount} Unread</span>
          </div>
        )}
      </div>

      {/* Notification Filters */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("compliance")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "compliance"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            Compliance Alerts
          </button>
          <button
            onClick={() => setActiveFilter("licence")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "licence"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            Licence Updates
          </button>
          <button
            onClick={() => setActiveFilter("system")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === "system"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            System Notifications
          </button>
        </div>
      </div>

      {/* Notification Feed */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-card rounded-lg p-12 border border-border shadow-sm text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You don't have any notifications in this category.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-card rounded-lg p-6 border shadow-sm transition-all hover:shadow-md ${
                  notification.unread
                    ? "border-gray-900 dark:border-white"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${styles.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={styles.text}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {notification.title}
                          {notification.unread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${styles.border} border`}>
                        {notification.type === "warning" && "Warning"}
                        {notification.type === "positive" && "Positive"}
                        {notification.type === "info" && "Information"}
                        {notification.type === "system" && "System"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-4">
                      {notification.description}
                    </p>

                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {notification.unread && (
                        <button className="px-4 py-2 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-900 dark:border-white flex items-center gap-2 text-sm">
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
            <button className="px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5" />
              Mark All as Read
            </button>
            <button className="px-6 py-3 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-900 dark:border-white flex items-center gap-2 justify-center">
              <Bell className="w-5 h-5" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

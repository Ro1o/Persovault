import { createContext, useContext, useState } from "react";

export interface Notification {
  id: number;
  type: "warning" | "positive" | "info" | "system";
  category: "compliance" | "licence" | "system" | "behaviour";
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  details: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "warning",
    category: "compliance",
    title: "Approaching Penalty Points Limit",
    description: "You currently have 8 out of 12 penalty points. Further violations may result in licence suspension.",
    timestamp: "13 Mar 2026 – 09:45",
    unread: true,
    details: "You have accumulated 8 out of 12 penalty points. If you reach 12 points, your driving licence will be automatically suspended for a minimum of 6 months. To reduce your points, maintain a clean driving record for 36 consecutive months. Avoid further violations including speeding, using a mobile phone while driving, and failure to wear a seatbelt.",
  },
  {
    id: 2,
    type: "positive",
    category: "behaviour",
    title: "Risk Score Improved",
    description: "Your suspension risk has decreased from 18% to 15%. Keep maintaining safe driving behaviour.",
    timestamp: "12 Mar 2026 – 14:20",
    unread: true,
    details: "Your AI-calculated suspension risk score has dropped from 18% to 15% over the past 30 days. This improvement is attributed to your consistent clean driving record and the natural expiry of older minor offences. Continue maintaining safe driving habits to further reduce your risk score.",
  },
  {
    id: 3,
    type: "info",
    category: "licence",
    title: "Licence Renewal Reminder",
    description: "Your driving licence expires on 01 Jan 2034. Ensure renewal before expiry.",
    timestamp: "10 Mar 2026 – 08:00",
    unread: false,
    details: "Your driving licence (MU/2024/AB123) is valid until 01 January 2034. You will need to visit the National Transport Authority (NTA) office at least 30 days before expiry to renew your licence. Required documents: current licence, national ID, medical certificate, and renewal fee payment.",
  },
  {
    id: 4,
    type: "system",
    category: "system",
    title: "Behaviour Passport Generated",
    description: "Your digital behaviour passport has been successfully refreshed.",
    timestamp: "08 Mar 2026 – 11:30",
    unread: false,
    details: "Your digital behaviour passport has been regenerated with the latest data. The passport includes your current penalty points, offence history, risk classification, and AI-generated behaviour score. This passport is valid for 5 minutes when presented for verification.",
  },
  {
    id: 5,
    type: "positive",
    category: "behaviour",
    title: "Clean Driving Milestone",
    description: "Congratulations! You've completed 145 days without any violations.",
    timestamp: "05 Mar 2026 – 10:15",
    unread: false,
    details: "You have successfully maintained a clean driving record for 145 consecutive days. This is a significant achievement that positively impacts your AI behaviour score and reduces your suspension risk. At 365 days, you will qualify for a risk score reduction bonus.",
  },
  {
    id: 6,
    type: "info",
    category: "system",
    title: "System Maintenance Notice",
    description: "PersoVault will undergo scheduled maintenance on 20 Mar 2026 from 02:00 to 04:00.",
    timestamp: "01 Mar 2026 – 16:00",
    unread: false,
    details: "PersoVault will undergo scheduled system maintenance on 20 March 2026 from 02:00 to 04:00 (Mauritius Time). During this period, the system will be unavailable. Please plan any required verifications before or after this window.",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
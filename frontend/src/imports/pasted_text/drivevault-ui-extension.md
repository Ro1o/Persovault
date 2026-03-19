dditional DriveVault Pages – Figma Prompt Extension

Extend the DriveVault – Secure Digital Identity Wallet UI design by adding three additional driver interface pages:

Driver Profile
Behaviour History
Notification Center

All pages must follow the existing DriveVault design system:

Rounded floating cards

Minimal modern layout

Light and Dark mode compatibility

Responsive for desktop, tablet, and mobile

Consistent typography and spacing

React component-friendly layout

PAGE — Driver Profile

Route:

/app/driver/profile

Purpose:

Allow drivers to view their personal information, licence details, and account data.

Layout:

Top section → profile summary card
Middle section → personal information
Bottom section → licence details and system account details

Profile Header Card

Display a large profile card with:

Driver Photo / Avatar
Full Name
Driver ID
Licence Number
Compliance Status badge
Trust Level percentage

Example data:

Name: John Michael Smith
Driver ID: DRV-001
Licence Number: MU/2024/AB123
Compliance Status: COMPLIANT
Trust Level: 85%

Include Edit Profile button.

Personal Information Section

Display information cards for:

Full Name
Date of Birth
Gender
Nationality
Blood Group
Address
Phone Number
Email Address

Use a two-column responsive layout.

Licence Details Section

Display:

Licence Number
Licence Category
Issue Date
Expiry Date
Licence History

Example history:

First Issued: 15 Mar 2010
Last Renewal: 01 Jan 2024
Account Security Section

Display:

Username
Role: Driver
Last Login Time
Account Status

Include buttons:

Update Password
Enable Two-Factor Authentication
PAGE — Behaviour History

Route:

/app/driver/history

Purpose:

Display a timeline of driver behaviour, offences, and AI risk evolution.

Layout:

Top → behaviour summary
Middle → behaviour timeline
Bottom → offence history

Behaviour Summary Cards

Display metrics:

Stability Index
Current Penalty Points
Clean Driving Days
Suspension Risk

Example values:

Stability Index: 92%
Penalty Points: 8 / 12
Clean Driving Days: 145
Suspension Risk: 15%
Behaviour Timeline

Design a vertical timeline component showing behaviour events.

Example timeline entries:

10 Feb 2024 – Traffic Violation
Failure to stop at mandatory stop sign
Location: Quatre Bornes

20 Jan 2024 – Mobile Phone Violation
Using mobile phone while driving
Location: Curepipe

15 Aug 2023 – Speeding Violation
Exceeded speed limit by 25 km/h
Location: Port Louis

03 May 2021 – Red Light Violation (Expired)
Location: Quatre Bornes

Timeline should visually indicate:

Active violations
Expired violations
Positive behaviour periods

Use icons and color-coded status.

AI Behaviour Trend Chart

Display a line chart showing risk score changes over time.

Example months:

Sep → 25%
Oct → 23%
Nov → 21%
Dec → 20%
Jan → 18%
Feb → 16%
Mar → 15%

Chart should show decreasing risk trend.

PAGE — Notification Center

Route:

/app/notifications

Purpose:

Display system alerts and driver notifications.

Layout:

Top → notification filter controls
Middle → notification feed
Bottom → action buttons

Notification Filters

Include filter tabs:

All
Compliance Alerts
Licence Updates
System Notifications
Notification Feed

Display notification cards.

Example notifications:

Compliance Warning
Approaching Penalty Points Limit
You currently have 8 out of 12 penalty points.
Further violations may result in licence suspension.

Status: Warning (orange)

Behaviour Update
Risk Score Improved
Your suspension risk has decreased from 18% to 15%.
Keep maintaining safe driving behaviour.

Status: Positive (green)

Licence Renewal Reminder
Licence Renewal Reminder
Your driving licence expires on 01 Jan 2034.
Ensure renewal before expiry.

Status: Information (blue)

System Notification
Behaviour Passport Generated
Your digital behaviour passport has been successfully refreshed.

Status: Info

Each notification should display:

Icon
Title
Description
Timestamp

Example:

13 Mar 2026 – 09:45

Include actions:

Mark as Read
View Details
UI Components Required

Add new reusable components:

DriverProfileCard
PersonalInfoSection
LicenceDetailsCard
BehaviourTimeline
NotificationCard
NotificationFilterTabs

These components should be designed so they can be easily implemented as React components.

Design Requirements

Maintain consistency with existing DriveVault UI:

Rounded floating cards

Soft shadows

Minimal layout

Clear hierarchy

Responsive grid layout

Smooth transitions

Ensure compatibility with Light Mode and Dark Mode themes.
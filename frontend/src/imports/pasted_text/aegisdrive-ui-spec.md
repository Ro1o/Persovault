Full Figma Make Prompt

Design a modern, professional, fully responsive web application UI for a system called:

"AegisDrive – Secure Digital Identity Wallet"

The system is a government-grade digital identity and behavioural compliance monitoring platform for driving licences.

The frontend will be built using React (JavaScript) and communicates with a FastAPI backend providing AI behavioural risk predictions and digital identity verification.

The interface must support three user roles with role-based access control:

Driver
Police Officer
Administrator

The design must support light mode and dark mode, with a toggle in the top navigation bar. Use a clean, modern, professional design suitable for a government or cybersecurity dashboard.

The system must be fully responsive for desktop, tablet, and mobile.

Use dashboard-style layouts with cards, charts, analytics panels, QR scanning interfaces, and identity cards.

Do not include branding colours yet because the colour palette will be added later.

Global Layout

The application layout should include:

Top Navigation Bar
Left Sidebar Navigation
Main Content Area

Top Navbar should include:

System Logo (AegisDrive)
Dark / Light mode toggle
Notification icon
User profile dropdown

Sidebar navigation changes based on the user role.

User Roles

Driver
Police Officer
Administrator

Each role has its own dashboard and permissions.

Page 1 — Login Page

Create a clean authentication screen with a centered login card.

Layout:

System Logo
System Name: AegisDrive – Secure Digital Identity Wallet

Input fields:

Username
Password

Dropdown for role selection:

Driver
Police
Admin

Login Button

Below login button show security message:

"Secure Government Identity System"

Design style:

Minimal modern login card
Dark and light mode compatible
Fully responsive

Driver Interface

Drivers can only see their own data.

Drivers cannot search other drivers or access system databases.

Driver Dashboard

Create a personal behaviour monitoring dashboard.

Components:

Driver Information Card:

Driver ID
Licence Number
Compliance Status
Trust Level

AI Behaviour Risk Panel:

Suspension Risk Gauge (percentage risk of suspension within 6 months)

Behaviour Metrics Panel:

Stability Index
Days Since Last Offence
Suspension Proximity
Behaviour Trend Indicator

Charts:

Behaviour Trend Chart showing driver risk trend over time.

Layout should display analytics cards at the top and charts below.

Digital Behaviour Passport Page

This page displays the Digital Behaviour Passport.

Design a digital identity card interface similar to Apple Wallet or Google Pay cards.

Include:

Driver Name
Driver ID
Licence Number
Risk Level
Trust Level

Issued Timestamp
Expiry Timestamp

QR Code for verification

Below the card display a detailed passport panel with:

Compliance Status
Stability Index
Offence Summary
AI Prediction Explanation

Include a passport integrity indicator showing:

VALID
EXPIRED
TAMPERED

Police Officer Interface

Police officers use the system for roadside verification.

They cannot access the full driver database.

Police Sidebar Navigation:

Verification Scanner
Driver Passport Check
Logout

Passport Verification Console

Design a verification interface optimized for tablets and mobile devices.

Include two verification methods:

QR Code Scanner panel
Manual Passport Token Input

Verification result panel must show:

Verification Status:

VALID
EXPIRED
TAMPERED

Driver Summary Panel:

Driver ID
Risk Level
Compliance Status
Trust Level

Add a large visual verification badge indicating the result.

Administrator Interface

Admins have full system access.

Admin Sidebar Navigation:

Dashboard
Driver Search
AI Behaviour Analysis
Digital Passport Viewer
Verification Console
System Logs
User Management
Logout

Admin Dashboard

Create a full system monitoring dashboard.

Top analytics cards:

Total Drivers
High Risk Drivers
Active Passports
Verification Requests

Charts:

Suspension Risk Distribution
Behaviour Trend Chart

Panels:

AI Prediction Summary
Top Risk Factors (Explainable AI)

Example risk factors:

Current Points
Severe Offences
Offences Last 12 Months

Driver Search Page (Admin Only)

Include a search bar allowing admins to find drivers by:

Driver ID
Licence Number
Name

Search results should show:

Driver Card List with:

Driver ID
Compliance Status
Risk Level
Last Offence Date

Clicking a driver opens the Driver Behaviour Dashboard.

AI Behaviour Analysis Page

Display system-wide analytics including:

Risk Level Distribution Chart
Offence Category Distribution
Suspension Probability Trends

Include an Explainable AI panel showing most influential features used in prediction.

System Logs Page

Create a table layout displaying:

Verification Logs
Passport Generation Logs
User Activity Logs

Columns:

Timestamp
User Role
Action
Driver ID
Verification Result

UI Components

Design reusable components:

Sidebar Navigation
Navbar
Analytics Cards
Risk Gauge
Behaviour Charts
Driver Identity Card
QR Verification Panel
Log Tables

Charts Required

Suspension Risk Gauge
Behaviour Trend Line Chart
Offence Distribution Chart
Risk Level Distribution Chart

Charts should be clean and dashboard-friendly.

Responsive Behaviour

Desktop Layout:

Sidebar + content panel layout

Tablet Layout:

Collapsible sidebar

Mobile Layout:

Top navigation with expandable menu
Cards stacked vertically
Charts responsive

Design Style

Professional government dashboard
Cybersecurity analytics aesthetic
Clean card-based UI
Minimal clutter
Modern typography
Icon-based navigation

Design should feel like a secure digital government platform.

Design Deliverables

Generate high-fidelity screens for:

Login Page
Driver Dashboard
Digital Behaviour Passport
Police Verification Console
Admin Dashboard
Driver Search Page
AI Behaviour Analysis Page
System Logs Page

Important Design Notes

Do not assign final colours yet because a custom colour palette will be added later.

Focus on layout, components, and usability.

The interface should look like a secure AI-powered government monitoring system.

What This Will Generate in Figma

Figma Make should create a full design system including:

Login UI
Dashboard layouts
Identity passport UI
Verification console
Admin analytics panels

You can then directly translate these designs into React components.
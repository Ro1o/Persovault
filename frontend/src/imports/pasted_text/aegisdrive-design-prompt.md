Complete Figma Make Prompt

AegisDrive – Secure Digital Identity Wallet

Design a modern, fully responsive web application UI for a secure government platform called:

AegisDrive – Secure Digital Identity Wallet

The system is a digital identity wallet and behavioural compliance platform for driving licences and identity documents in Mauritius.

The platform integrates:

Digital Identity Wallet
Driving Licence Management
AI Behavioural Risk Prediction
Secure Identity Verification

The frontend will be implemented using React (JavaScript) and the backend uses FastAPI APIs.

The UI must support Role-Based Access Control (RBAC) with three roles:

Driver
Police Officer
Administrator

The application must support both Light Mode and Dark Mode, similar to the reference UI provided.

The light and dark modes must maintain the same layout while switching colors.

Design Style

Use the UI style from the reference image:

Rounded UI cards
Minimal modern typography
Soft shadows
Floating card panels
Smooth gradient cards

Dark mode should feature:

Dark background
Dark gradient cards
White typography

Light mode should feature:

Light background
Soft grey cards
Dark typography

Cards should appear floating and modern, inspired by the template UI.

Global Layout

All authenticated pages include:

Top Navigation Bar
Left Sidebar Navigation
Main Content Area

Top Navbar Components:

System Logo
System Name: AegisDrive
Dark / Light Mode Toggle
Notification Icon
User Profile Menu

Sidebar navigation changes based on the user role.

User Roles
Driver

Drivers can only view their own identity documents and behavioural information.

Driver pages:

Driver Dashboard
Identity Wallet
Digital NIC
Digital Driving Licence
Digital Travel Passport
Digital Behaviour Passport

Drivers cannot search other users.

Police Officer

Police officers verify identity and licences during inspections.

Police pages:

Verification Console
Driver Identity Verification Result

Police cannot search drivers or access the database.

Administrator

Admins manage the entire system.

Admin pages:

Admin Dashboard
Driver Search
AI Behaviour Analysis
System Logs
User Management

PAGE 1 — Login Page

Design a centered authentication card.

Components:

System Logo
Title:

AegisDrive – Secure Digital Identity Wallet

Fields:

Username
Password

Role Selector:

Driver
Police Officer
Administrator

Login Button

Security note:

Secure Government Identity Verification System

The login card should follow the rounded card UI style.

PAGE 2 — Driver Dashboard

Purpose: show driver's compliance and behavioural status.

Top Cards:

Driver ID
Licence Number
Compliance Status
Trust Level

AI Risk Panel:

Suspension Risk Gauge showing probability of licence suspension in 6 months.

Behaviour Metrics Cards:

Stability Index
Days Since Last Offence
Suspension Proximity
Behaviour Trend Indicator

Charts:

Behaviour Trend Line Chart

Cards must follow the rounded floating style inspired by the template UI.

PAGE 3 — Identity Wallet (Driver Only)

Create a Digital Identity Wallet interface.

Display identity credentials as wallet cards.

Cards:

Digital NIC
Digital Driving Licence
Digital Passport
Digital Behaviour Passport

Desktop layout:

Grid layout

Mobile layout:

Stacked cards

Cards should use rounded floating card style.

Each card opens a detailed viewer page.

PAGE 4 — Digital NIC (Driver Only)

Design a digital version of the Mauritian National Identity Card.

Fields:

Full Name
NIC Number
Date of Birth
Gender
Nationality
Signature
Issue Date
Expiry Date

Visual elements:

Mauritius Coat of Arms
Mauritius Flag
Profile Photo
Signature Section

Design should resemble a real NIC card adapted for digital display.

PAGE 5 — Digital Driving Licence

Design a digital driving licence card.

Fields:

Driver Name
Driver ID
Licence Number
Licence Category
Issue Date
Expiry Date

Behavioural compliance data:

Compliance Status
Risk Level
Trust Level

Include QR code for verification.

PAGE 6 — Digital Travel Passport

Create an interactive digital passport experience.

Step 1 — Passport Cover

Display a closed passport cover.

Elements:

Republic of Mauritius
Passport
Mauritius Coat of Arms

Add subtle animation on the coat of arms.

Instruction text:

Swipe to open passport

Step 2 — Passport Opening

User swipes to open the passport.

Animation:

Booklet page flip animation.

Step 3 — Passport Identity Page

Fields:

Country: Republic of Mauritius
Passport Number
Surname
Given Names
Nationality
Date of Birth
Place of Birth
Sex
Issue Date
Expiry Date
Authority

Visual elements:

Passport Photo
Security pattern background
MRZ passport code lines

Important:

Do NOT include QR codes.

PAGE 7 — Digital Behaviour Passport

Fields:

Driver ID
Risk Level
Trust Level
Compliance Status

Behaviour indicators:

Stability Index
Suspension Proximity

Metadata:

Issued Timestamp
Expiry Timestamp

Include QR code for verification.

Display passport integrity status:

VALID
EXPIRED
TAMPERED

PAGE 8 — Police Verification Console

Optimized for tablet and mobile devices.

Verification methods:

QR Code Scanner
Manual Passport Token Input

Verification result panel shows:

Verification Status:

VALID
EXPIRED
TAMPERED

Driver Summary:

Driver ID
Compliance Status
Risk Level
Trust Level

Display a large verification badge.

PAGE 9 — Administrator Dashboard

System analytics dashboard.

Top Cards:

Total Drivers
High Risk Drivers
Active Behaviour Passports
Verification Requests

Charts:

Suspension Risk Distribution
Behaviour Trend Across Drivers

Panel:

Explainable AI Risk Factors.

PAGE 10 — Driver Search (Admin Only)

Search fields:

Driver ID
Licence Number
Driver Name

Search results show driver cards with:

Driver ID
Compliance Status
Risk Level
Last Offence Date

Selecting a driver opens Driver Profile Page.

PAGE 11 — AI Behaviour Analysis

Charts:

Risk Level Distribution
Offence Category Distribution
Suspension Probability Trends

Include explainable AI insights.

PAGE 12 — System Logs

Display log table:

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

Reusable components:

Navbar
Sidebar
Wallet Cards
Identity Cards
Risk Gauge
Charts
QR Scanner
Log Table

Design components so they can be easily converted into React components.

Charts Required

Suspension Risk Gauge
Behaviour Trend Chart
Offence Distribution Chart
Risk Level Distribution Chart

Responsive Behaviour

Desktop:

Sidebar navigation layout

Tablet:

Collapsible sidebar

Mobile:

Stacked cards
Swipe gestures
Touch-friendly interactions
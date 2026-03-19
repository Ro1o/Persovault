Complete Figma Make Prompt

AegisDrive – Secure Digital Identity Wallet

Design a modern, professional, fully responsive web application UI for a platform called:

AegisDrive – Secure Digital Identity Wallet

The system is a government-grade digital identity and behavioural compliance monitoring platform for driving licences and identity documents.

The frontend will be implemented using React (JavaScript) and communicates with a FastAPI backend API.

The platform integrates:

Digital Identity Wallet
Driving Licence Management
Behavioural Risk Prediction (AI)
Secure Identity Verification

The UI must support three user roles using Role-Based Access Control:

Driver
Police Officer
Administrator

The system must support Dark Mode and Light Mode.

Use a modern card-based UI style similar to the reference mobile template provided, featuring:

Soft rounded cards
Subtle gradients
Floating card panels
Smooth shadows
Modern minimal typography

The design should feel like a secure digital government platform combined with a modern mobile wallet experience.

The system must be fully responsive for desktop, tablet, and mobile.

Global Application Layout

Authenticated pages must include:

Top Navigation Bar
Left Sidebar Navigation
Main Content Area

Top Navbar Components:

System Logo
System Name: AegisDrive
Dark/Light Mode Toggle
Notification Icon
User Profile Menu

Sidebar navigation changes depending on the user role.

Cards and UI panels should follow the rounded gradient card style inspired by the provided template image.

Design Style

Use the template colour concept shown in the reference image:

Dark gradient cards
Light background panels
Rounded corners
Soft shadows
Minimal icons

Card styles should include:

Dark gradient cards
Soft white cards
Subtle elevation shadows

Cards should feel floating and modern.

User Roles
Driver

Drivers can only view their own identity credentials and behavioural data.

Drivers cannot search other users.

Driver pages include:

Driver Dashboard
Identity Wallet
Digital Driving Licence
Digital NIC
Digital Passport
Digital Behaviour Passport

Police Officer

Police officers verify identities during inspections.

Police can:

Scan identity credentials
Verify driving licence status
Check compliance and risk level

Police cannot access driver databases.

Police pages include:

Verification Console
Driver Identity Verification Result

Administrator

Administrators have full system access.

Admin pages include:

Admin Dashboard
Driver Search
AI Behaviour Analysis
System Logs
User Management

PAGE 1 — Login Page

Purpose: authenticate users.

Layout:

Centered authentication card.

Components:

System Logo
System Title:

AegisDrive – Secure Digital Identity Wallet

Input Fields:

Username
Password

Role selector dropdown:

Driver
Police Officer
Administrator

Login Button

Below login button show message:

"Secure Government Identity Verification System"

Use the rounded card style from the template image.

PAGE 2 — Driver Dashboard

Purpose: show the driver's behavioural status and compliance.

Layout sections:

Top section → identity summary cards
Middle section → AI risk panel
Bottom section → behaviour analytics

Driver Info Cards:

Driver ID
Licence Number
Compliance Status
Trust Level

AI Risk Panel:

Suspension Risk Gauge (percentage probability of licence suspension in 6 months).

Behaviour Metrics Panel:

Stability Index
Days Since Last Offence
Suspension Proximity
Behaviour Trend Indicator

Charts:

Behaviour Trend Chart.

Cards should follow the modern gradient card style inspired by the template UI.

PAGE 3 — Identity Wallet (Driver Only)

Drivers have a Digital Identity Wallet containing identity credentials.

Wallet design should resemble Apple Wallet / Google Wallet style cards.

Display cards:

Digital NIC (Mauritian National Identity Card)
Digital Driving Licence
Digital Passport
Digital Behaviour Passport

Cards should use the rounded gradient style from the template image.

Desktop layout:

Cards arranged in grid.

Mobile layout:

Cards stacked vertically.

Each card is clickable to open the full credential viewer.

PAGE 4 — Digital NIC (Driver Only)

Design a digital version of the Mauritian National Identity Card.

The design should resemble the real NIC layout.

Fields displayed:

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
Signature Area

Design style:

Realistic identity card design adapted for digital wallet display.

PAGE 5 — Digital Driving Licence (Driver Only)

Design a digital driving licence card.

Fields displayed:

Driver Name
Driver ID
Licence Number
Licence Category
Issue Date
Expiry Date

Behavioural Data:

Compliance Status
Risk Level
Trust Level

Include a QR Code for verification.

Below the card display detailed licence information.

PAGE 6 — Digital Travel Passport (Driver Only)

Design a Digital Passport with interactive animation.

Step 1 — Passport Cover

Display a closed passport cover.

Elements on cover:

Republic of Mauritius
Passport
Mauritius Coat of Arms

Add subtle coat of arms animation (soft glow or shimmer).

Below the passport display instruction:

"Swipe to open passport"

Step 2 — Passport Opening Animation

User swipes to open the passport.

The passport opens with a booklet-style page flip animation.

Step 3 — Passport Identity Page

Display passport identity page.

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
Security background pattern
Machine Readable Zone (MRZ lines)

Important:

Do NOT include QR codes on the passport page.

PAGE 7 — Digital Behaviour Passport (Driver Only)

Design a behaviour passport card.

Fields:

Driver ID
Risk Level
Trust Level
Compliance Status

Behaviour Indicators:

Stability Index
Suspension Proximity

Metadata:

Issued Timestamp
Expiry Timestamp

Include QR code for verification.

Include passport integrity indicator:

VALID
EXPIRED
TAMPERED

PAGE 8 — Police Verification Console

Police interface optimized for tablet and mobile use.

Verification methods:

QR Code Scanner
Manual Passport Token Input

Verification results display:

Verification Status

VALID
EXPIRED
TAMPERED

Driver Summary:

Driver ID
Compliance Status
Risk Level
Trust Level

Display a large status badge after verification.

PAGE 9 — Administrator Dashboard

Admin monitoring interface.

Top analytics cards:

Total Registered Drivers
High Risk Drivers
Active Behaviour Passports
Verification Requests Today

Charts:

Suspension Risk Distribution
Behaviour Trend Chart

Panels:

AI Prediction Summary

Explainable AI panel showing top risk factors.

PAGE 10 — Driver Search (Admin Only)

Admin can search using:

Driver ID
Licence Number
Driver Name

Search results display driver cards showing:

Driver ID
Compliance Status
Risk Level
Last Offence Date

Selecting a driver opens driver profile page.

PAGE 11 — AI Behaviour Analysis

System-wide analytics page.

Charts include:

Risk Level Distribution
Offence Category Distribution
Suspension Probability Trends

Include explainable AI insights.

PAGE 12 — System Logs

Display table of system activity.

Logs include:

Verification Logs
Passport Generation Logs
User Activity Logs

Columns:

Timestamp
User Role
Action
Driver ID
Verification Result

UI Components Required

Reusable components:

Navbar
Sidebar
Analytics Cards
Risk Gauge
Charts
Identity Wallet Cards
Digital Passport Viewer
QR Scanner Panel
Log Table

Design components so they can easily be implemented as React components.

Charts Required

Suspension Risk Gauge
Behaviour Trend Chart
Offence Distribution Chart
Risk Level Distribution Chart

Responsive Behaviour

Desktop:

Sidebar layout.

Tablet:

Collapsible sidebar.

Mobile:

Stacked cards
Touch gestures
Swipe animations

Important Design Notes

Do not assign final colours yet because the project colour palette will be added later.

Focus on:

Layout
Card hierarchy
Component system
Responsiveness

Ensure the UI structure is modular and compatible with React component architecture.
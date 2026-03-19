Figma Make Prompt

DriveVault – Secure Digital Identity Wallet

Design a modern, fully responsive web and mobile application UI for a system called:

DriveVault – Secure Digital Identity Wallet

DriveVault is a government-grade digital identity wallet and behavioural compliance platform for Mauritian driving licences and identity documents.

The platform integrates:

Digital Identity Wallet
Driving Licence Management
Digital National Identity Card (NIC)
Digital Travel Passport
AI Behavioural Risk Prediction
Secure Identity Verification

The frontend will be implemented using React (JavaScript) and the backend uses FastAPI APIs.

The UI must support Role-Based Access Control (RBAC) with three roles:

Driver
Police Officer
Administrator

The system must support Light Mode and Dark Mode, similar to the UI reference image.

Design Style

Use a modern rounded card-based UI style inspired by the provided template image.

Design characteristics:

Rounded UI cards
Soft floating shadows
Minimal modern typography
Gradient dark cards
Clean white panels
Mobile-friendly layout

The design should feel like a modern digital wallet combined with a government analytics dashboard.

Color Palette

Base the palette on the template UI style.

Light Mode

Background

#F5F5F5

Card background

#FFFFFF

Primary dark card

#2C2C2C

Text primary

#111111

Text secondary

#6B6B6B

Dark Mode

Background

#0F0F0F

Card background

#1E1E1E

Secondary card

#2A2A2A

Primary text

#FFFFFF

Secondary text

#A3A3A3

Status Colors

Success

#22C55E

Warning

#F59E0B

High Risk

#EF4444
Typography

Use a modern UI font such as:

Inter

Sizes

Heading

28px

Card Title

18px

Body Text

14px

Small Text

12px
Global Layout

All authenticated pages include:

Top Navigation Bar
Left Sidebar Navigation
Main Content Area

Navbar components:

DriveVault Logo
Dark / Light Mode Toggle
Notification Icon
User Profile Menu

Sidebar navigation changes depending on the user role.

User Roles
Driver

Drivers can only view their own identity credentials and behavioural data.

Driver pages:

Driver Dashboard
Identity Wallet
Digital NIC
Digital Driving Licence
Digital Passport
Digital Behaviour Passport

Drivers cannot search other users.

Police Officer

Police officers verify identity and licences during inspections.

Police can:

Scan QR codes
Verify licences
Check compliance and risk level

Police pages:

Verification Console
Driver Verification Result

Police cannot access the driver database.

Administrator

Admins manage the system.

Admin pages:

Admin Dashboard
Driver Search
AI Behaviour Analysis
System Logs
User Management

PAGE 1 — Login Page

Create a centered authentication card.

Elements:

DriveVault logo
Title

DriveVault
Secure Digital Identity Wallet

Fields:

Username
Password

Role selector

Driver
Police Officer
Administrator

Login button

Security message

Secure Government Identity Verification System

PAGE 2 — Driver Dashboard

Purpose: show personal driver status.

Top cards:

Driver ID
Licence Number
Compliance Status
Trust Level

AI Risk Panel:

Suspension Risk Gauge showing probability of licence suspension in the next 6 months.

Behaviour Metrics Cards:

Stability Index
Days Since Last Offence
Suspension Proximity
Behaviour Trend Indicator

Charts:

Behaviour Trend Line Chart

Cards must follow rounded floating card style.

PAGE 3 — Identity Wallet (Driver Only)

Design a digital identity wallet interface.

Cards displayed:

Digital NIC
Digital Driving Licence
Digital Travel Passport
Digital Behaviour Passport

Cards appear as rounded floating wallet cards.

Desktop layout:

Grid layout

Mobile layout:

Stacked cards

Each card opens a detailed viewer page.

PAGE 4 — Digital NIC (Driver Only)

Design a digital Mauritian National Identity Card.

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
Signature section

Design should resemble the real NIC card but adapted for digital display.

PAGE 5 — Digital Driving Licence

Fields:

Driver Name
Driver ID
Licence Number
Licence Category
Issue Date
Expiry Date

Behavioural data:

Compliance Status
Risk Level
Trust Level

Include QR Code for verification.

PAGE 6 — Digital Travel Passport

Create an interactive passport experience.

Step 1 — Passport Cover

Display a closed passport.

Elements:

Republic of Mauritius
Passport
Mauritius Coat of Arms

Add subtle coat-of-arms animation.

Text below:

Swipe to open passport

Step 2 — Passport Opening Animation

User swipes to open passport.

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
Security background pattern
Machine Readable Zone (MRZ)

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

Include QR Code for verification.

Integrity status indicator:

VALID
EXPIRED
TAMPERED

PAGE 8 — Police Verification Console

Designed for mobile and tablet usage.

Verification methods:

QR Code Scanner
Manual Passport Token Input

Verification result panel shows:

Verification Status

VALID
EXPIRED
TAMPERED

Driver Summary:

Driver ID
Compliance Status
Risk Level
Trust Level

Display large verification badge.

PAGE 9 — Administrator Dashboard

Top analytics cards:

Total Drivers
High Risk Drivers
Active Behaviour Passports
Verification Requests

Charts:

Suspension Risk Distribution
Behaviour Trends Across Drivers

Panel:

Explainable AI Risk Factors.

PAGE 10 — Driver Search

Search fields:

Driver ID
Licence Number
Driver Name

Search results show:

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

Display log table.

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

UI Components

Design reusable components for React implementation:

Navbar
Sidebar
Dashboard Cards
Wallet Cards
Identity Cards
Risk Gauge
Charts
QR Scanner
Log Table

Charts

Suspension Risk Gauge
Behaviour Trend Chart
Offence Distribution Chart
Risk Level Distribution Chart

Responsive Behaviour

Desktop

Sidebar navigation layout

Tablet

Collapsible sidebar

Mobile

Stacked cards
Swipe gestures
Touch-friendly interactions
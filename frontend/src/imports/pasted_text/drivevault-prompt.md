Figma Make Prompt

DriveVault – Secure Digital Identity Wallet

Design a fully responsive web application UI for a government-grade digital identity platform called:

DriveVault – Secure Digital Identity Wallet

DriveVault is a platform for Mauritian driver identity management, behavioural compliance monitoring, and secure verification.

The system integrates:

Digital Identity Wallet

National Identity Card (NIC)

Driving Licence

Travel Passport

Behaviour Passport (AI-generated)

Vehicle Compliance Documents

Roadside Verification System

AI Behaviour Risk Monitoring

The frontend will be implemented using React and the backend will use FastAPI APIs.

The interface must support three user roles:

Driver
Police Officer
Administrator

The UI must support light mode and dark mode.

Use a modern card-based dashboard design with rounded floating panels.

The design must be fully responsive for desktop, tablet, and mobile.

Global Layout

All authenticated pages include:

Top Navigation Bar
Left Sidebar Navigation
Main Content Area

Top Navigation Bar contains:

DriveVault Logo
Dark/Light Mode Toggle
Notification Icon
User Profile Menu

Sidebar navigation changes depending on the user role.

Public Pages
Landing Page

Route

/

Purpose

Show DriveVault system introduction.

Sections:

Hero section with system title
Feature overview
Benefits of digital identity wallet
Login button

Login Page

Route

/login

Components:

DriveVault logo
Title:

DriveVault – Secure Digital Identity Wallet

Fields:

Username
Password

Role selector dropdown:

Driver
Police
Admin

Login button

Security message:

Secure Government Identity Verification System

Driver Role Interface

Base route:

/app/driver/*

Drivers can only access their own credentials and behavioural data.

Driver Dashboard

Route

/app/driver/dashboard

Purpose

Provide driver behaviour overview.

Top cards:

Driver ID
Licence Number
Compliance Status
Trust Level

AI Risk Panel:

Suspension Risk Gauge (6-month forecast).

Behaviour Metrics Cards:

Stability Index
Days Since Last Offence
Suspension Proximity
Behaviour Trend Indicator

Chart:

Behaviour Risk Trend Line Chart.

Driver Profile Page

Route

/app/driver/profile

Sections:

Profile Header
Personal Information
Licence Details
Vehicle Information
Vehicle Compliance
Account Security

Profile Header Card

Display:

Driver Photo
Full Name
Driver ID
Licence Number
Compliance Status Badge
Trust Level

Include button:

Edit Profile (opens edit modal)

Personal Information Section

Two-column responsive grid.

Fields:

Full Name
Date of Birth
Gender
Nationality
Address
Phone Number
Email Address

Licence Details Section

Display:

Licence Number
Licence Category
Issue Date
Expiry Date

Include Licence History Timeline:

First Issued
Renewed
Next Renewal

Vehicle Information Section

Fields:

Vehicle Registration Number
Vehicle Make
Vehicle Model
Vehicle Year
Vehicle Type
Engine Capacity

Example:

Toyota Corolla 2012

Vehicle Compliance Section

Display three compliance cards.

Car Insurance Card

Fields:

Insurance Provider
Policy Number
Coverage Type
Issue Date
Expiry Date
Status

Button:

View Insurance Document

Action:

Open Insurance certificate viewer.

Vehicle Declaration Card

Fields:

Declaration ID
Declaration Type
Issue Date
Expiry Date
Status

Button:

Download Declaration

Action:

Download declaration certificate.

Vehicle Fitness Certificate Card

Only show this card if vehicle age is greater than 10 years.

Condition:

Vehicle Year < Current Year – 10

Fields:

Certificate ID
Inspection Date
Inspection Centre
Result
Next Inspection Due
Status

Button:

View Inspection Report

Identity Wallet

Route

/app/driver/wallet

Display wallet cards:

Digital National Identity Card
Digital Driving Licence
Digital Travel Passport
Digital Behaviour Passport

Cards should appear in grid layout on desktop and stacked on mobile.

Each card opens a detailed credential page.

Digital National Identity Card

Route

/app/driver/nic

Display Mauritian NIC.

Fields:

Full Name
NIC Number
Date of Birth
Gender
Nationality
Address
Issue Date
Expiry Date

Include QR Code verification.

Digital Driving Licence

Route

/app/driver/licence

Fields:

Driver Name
Driver ID
Licence Number
Licence Category
Issue Date
Expiry Date

Compliance data:

Compliance Status
Risk Level
Trust Level

Include QR Code verification.

Digital Travel Passport

Route

/app/driver/travel-passport

Interaction design:

Passport Cover Screen

Display:

Republic of Mauritius
Passport
Mauritius Coat of Arms

Include animation on coat of arms.

Instruction text:

Swipe to open passport.

Passport Identity Page

Displayed after swipe animation.

Fields:

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

Do not include QR code.

Digital Behaviour Passport

Route

/app/driver/passport

Fields:

Driver ID
Compliance Status
Risk Level
Trust Level

Behaviour indicators:

Stability Index
Suspension Proximity

Metadata:

Issued Timestamp
Expiry Timestamp

Include QR code verification.

Include integrity status:

VALID
EXPIRED
TAMPERED

Penalty Points History

Route

/app/driver/penalty-points

Display:

Penalty points summary
Active violations
Expired violations

Show violation details:

Violation description
Location
Fine amount
Points
Status

Behaviour History

Route

/app/driver/history

Display:

Behaviour timeline
Violation timeline
AI behaviour trend

Charts:

Behaviour risk trend chart.

Notification Center

Route

/app/notifications

Display notifications such as:

Compliance alerts
Licence renewal reminders
Behaviour updates
System messages

Include buttons:

Mark as read
View details

Police Role Interface

Base route:

/app/police/*

Police only verify driver credentials.

Verification Console

Route

/app/police/verification

Verification methods:

QR Code Scanner
Manual Token Input

Verification results display:

Verification Status
Driver ID
Compliance Status
Risk Level
Trust Level

Status types:

VALID
EXPIRED
TAMPERED

Administrator Interface

Base route:

/app/admin/*

Admins manage the system.

Admin Dashboard

Route

/app/admin/dashboard

Analytics cards:

Total Drivers
High Risk Drivers
Active Behaviour Passports
Verification Requests

Charts:

Risk Distribution
Behaviour Trends

Explainable AI panel.

Driver Search

Route

/app/admin/search

Search by:

Driver ID
Licence Number
Driver Name

Results show driver cards.

Selecting a driver opens:

/app/admin/driver/:driverId
Driver Details Page

Display:

Driver identity information
Licence data
Behaviour metrics
Risk trend

AI Behaviour Analysis

Route

/app/admin/ai-analysis

Display AI metrics:

Model Accuracy
Precision
Recall
F1 Score

Charts:

Risk Distribution
Offence Categories
Suspension Probability Trends

Explainable AI feature importance.

User Management

Route

/app/admin/users

Admins can:

Create users
Edit users
Delete users
Assign roles

Roles:

Driver
Police
Admin

System Logs

Route

/app/admin/logs

Display activity logs.

Columns:

Timestamp
User Role
Action
Driver ID
Verification Result

Include search, filters, and export options.

UI Components

Design reusable UI components for React implementation:

Navbar
Sidebar
Wallet Cards
Credential Cards
Dashboard Cards
Risk Gauge
Charts
QR Scanner
Notification Cards
Log Table

Responsive Behaviour

Desktop

Sidebar layout.

Tablet

Collapsible sidebar.

Mobile

Stacked cards
Touch gestures
Swipe animations for passport.
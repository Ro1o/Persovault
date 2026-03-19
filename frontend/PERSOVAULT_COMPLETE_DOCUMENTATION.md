# PersoVault - Complete System Documentation

## 🔐 LOGIN CREDENTIALS

### Authentication System
- **Login Page**: `/login`
- **No password required** - Any username/password combination works
- **Role-based access** via dropdown selection

### Available Roles & Default Routes:

1. **DRIVER**
   - Username: Any
   - Password: Any
   - Default Landing: `/app/driver/dashboard`

2. **POLICE**
   - Username: Any
   - Password: Any
   - Default Landing: `/app/police/verification`

3. **ADMIN**
   - Username: Any
   - Password: Any
   - Default Landing: `/app/admin/dashboard`

---

## 📱 DRIVER ROLE - 7 PAGES

### 1. **Driver Dashboard** (`/app/driver/dashboard`)
**Purpose**: Personal behaviour monitoring overview

**Content**:
- **Driver Information Card**:
  - Driver ID: DRV-001
  - Licence Number: MU/2024/AB123
  - Compliance Status: COMPLIANT
  - Trust Level: High (85%)

- **AI Behaviour Risk Assessment**:
  - Suspension Risk Gauge: 15% (6 months forecast)
  - Visual circular gauge component

- **Behaviour Metrics** (3 cards):
  - Stability Index: 92% (+5% from last month)
  - Days Since Last Offence: 145 days (Improving)
  - Behaviour Trend: Positive (Low risk trajectory)

- **Behaviour Risk Trend Chart**:
  - Line chart showing 7 months of data (Sep-Mar)
  - Risk values decreasing from 25 to 15

---

### 2. **Identity Wallet** (`/app/driver/wallet`)
**Purpose**: Central hub for all digital credentials

**Content**: 4 clickable credential cards:

1. **Digital National Identity Card**
   - NIC No: M0101925M001
   - Status: Valid & Verified
   - Link: `/app/driver/nic`

2. **Digital Driving Licence**
   - Licence No: MU/2024/AB123
   - Valid until: 2034
   - Link: `/app/driver/licence`

3. **Digital Travel Passport**
   - Passport No: P1234567
   - Valid until: 2034
   - Link: `/app/driver/travel-passport`

4. **Digital Behaviour Passport**
   - Status: Compliant
   - Risk: Low
   - Trust: High
   - Link: `/app/driver/passport`

---

### 3. **Digital National Identity Card** (`/app/driver/nic`)
**Purpose**: Display Mauritian National ID

**Credential Data**:
- **Full Name**: John Michael Smith
- **NIC Number**: M0101925M001
- **Date of Birth**: 15/03/1992
- **Place of Birth**: Port Louis, Mauritius
- **Gender**: Male
- **Blood Group**: O+
- **Address**: 123 Royal Road, Port Louis, Mauritius
- **Issue Date**: 01/01/2020
- **Expiry Date**: 01/01/2030
- **Status**: VALID (green badge)
- **QR Code**: "PERSOVAULT:NIC:M0101925M001:JOHN MICHAEL SMITH"

**Additional Features**:
- Black/white gradient card design (dark mode inverts)
- Compliance Data section
- Security features listed
- Back button to wallet

---

### 4. **Digital Driving Licence** (`/app/driver/licence`)
**Purpose**: Display Mauritian Driving Licence

**Credential Data**:
- **Driver Name**: John Michael Smith
- **Driver ID**: DRV-001
- **Licence Number**: MU/2024/AB123
- **Licence Category**: B, B+E
- **Date of Birth**: 15/03/1992
- **Issue Date**: 01/01/2024
- **Expiry Date**: 01/01/2034
- **Status**: VALID (green badge)
- **QR Code**: "PERSOVAULT:LICENCE:DRV-001:MU/2024/AB123"

**Compliance Data**:
- Compliance Status: COMPLIANT
- Risk Level: Low (15%)
- Trust Level: High (85%)

**Additional Licence Information**:
- **Licence History**: First issued 15/03/2010, Renewed 01/01/2024
- **Penalty Points**: 8 points (max 12) - Clickable link to Penalty Points page
- **Endorsements**: No active endorsements

---

### 5. **Digital Travel Passport** (`/app/driver/travel-passport`)
**Purpose**: Display Mauritian Travel Passport

**Credential Data**:
- **Full Name**: John Michael Smith
- **Passport Number**: P1234567
- **Nationality**: Mauritian
- **Date of Birth**: 15/03/1992
- **Place of Birth**: Port Louis, Mauritius
- **Gender**: Male
- **Issue Date**: 01/01/2024
- **Expiry Date**: 01/01/2034
- **Status**: VALID (green badge)
- **QR Code**: "PERSOVAULT:PASSPORT:P1234567:JOHN MICHAEL SMITH"

**Travel Information**:
- Passport Type: Regular
- Authority: Ministry of Foreign Affairs, Mauritius
- Signature: [Signature field]

---

### 6. **Digital Behaviour Passport** (`/app/driver/passport`)
**Purpose**: AI-generated compliance document for roadside verification

**Credential Data**:
- **Driver Name**: John Michael Smith
- **Driver ID**: DRV-001
- **Licence Number**: MU/2024/AB123
- **Compliance Status**: COMPLIANT (green badge)
- **QR Code**: "PERSOVAULT:BEHAVIOUR:DRV-001:COMPLIANT:LOW"

**AI Risk Assessment**:
- **Suspension Risk**: 15% (Low - green)
- **Risk Gauge**: Visual circular indicator
- **Risk Factors Display**: Current Points (4), Severe Offences (0), Recent Offences (1)

**Behaviour Summary** (3 metrics):
- Stability Index: 92%
- Days Since Last Offence: 145
- Trust Level: High (85%)

**Compliance Metrics** (3 cards):
- Current Penalty Points: 8/12
- Active Violations: 3
- Clean Driving Days: 145

**Passport Validity**:
- Generated: 13 Mar 2026, 12:00 AM
- Valid Until: 13 Mar 2026, 11:59 PM
- Refresh Available: "Refresh Passport" button

---

### 7. **Penalty Points History** (`/app/driver/penalty-points`)
**Purpose**: Detailed view of all penalty points and violations

**Summary Card**:
- Current Total Points: 8
- Maximum Allowed: 12
- Active Violations: 3
- Progress Bar: 67% (Yellow/Orange warning)
- Warning Message: "Approaching maximum penalty points limit"

**Active Penalty Points** (3 violations):

1. **Speeding (PP-001)**
   - Description: Exceeding speed limit by 25 km/h in residential area
   - Location: Royal Road, Port Louis
   - Date Acquired: 15 Aug 2023
   - Expires On: 15 Aug 2026
   - Fine: Rs 3,000
   - Points: 4 (Red)
   - Status: ACTIVE (red badge)

2. **Mobile Phone Use (PP-002)**
   - Description: Using mobile phone while driving without hands-free device
   - Location: Motorway M1, Curepipe
   - Date Acquired: 20 Jan 2024
   - Expires On: 20 Jan 2027
   - Fine: Rs 1,500
   - Points: 3 (Orange)
   - Status: ACTIVE (red badge)

3. **Failure to Observe Traffic Signs (PP-003)**
   - Description: Failed to stop at mandatory stop sign
   - Location: Avenue de la Paix, Quatre Bornes
   - Date Acquired: 10 Feb 2024
   - Expires On: 10 Feb 2027
   - Fine: Rs 500
   - Points: 1 (Yellow)
   - Status: ACTIVE (red badge)

**Expired Penalty Points** (2 violations):

1. **Red Light Violation (PP-004)**
   - Description: Failed to stop at red traffic signal
   - Location: Junction Desroches, Quatre Bornes
   - Date Acquired: 03 May 2021
   - Expired On: 03 May 2024
   - Fine: Rs 3,000
   - Points: 4
   - Status: EXPIRED (gray badge, 60% opacity)

2. **No Seatbelt (PP-005)**
   - Description: Driver not wearing seatbelt
   - Location: Coastal Road, Flic en Flac
   - Date Acquired: 18 Nov 2020
   - Expired On: 18 Nov 2023
   - Fine: Rs 1,000
   - Points: 2
   - Status: EXPIRED (gray badge, 60% opacity)

**Information Box**:
- Points remain on licence for 3 years
- Maximum 12 points before suspension
- Points auto-expire after 3 years
- Serious offenses may cause immediate suspension

**Navigation**:
- Back button (navigate(-1)) returns to previous page

---

## 👮 POLICE ROLE - 1 PAGE

### **Verification Console** (`/app/police/verification`)
**Purpose**: Roadside verification of driver digital behaviour passports

**Verification Methods**:

1. **QR Code Scanner** (Primary Method)
   - Click "Start QR Scan" button
   - Opens fullscreen camera modal
   - Uses device camera (rear camera on mobile)
   - Live camera feed with blue targeting frame
   - "Stop Camera" button (red, overlaid on video)
   - Close button (X) in top-right corner
   - Cancel button at bottom
   - Auto-detects and processes QR codes
   - Error handling for camera permissions

2. **Manual Token Input** (Secondary Method)
   - Text input field for passport token
   - "Verify Passport" button
   - Manual entry fallback

**Verification Results**:

**Status Badges** (3 possible states):
1. **VALID** (Green)
   - CheckCircle icon
   - "Passport verified successfully"

2. **EXPIRED** (Yellow)
   - AlertTriangle icon
   - "Passport has expired"

3. **TAMPERED** (Red)
   - XCircle icon
   - "Passport integrity compromised"

**Driver Summary Card** (shown after verification):
- Driver Name: John Smith
- Driver ID: DRV-001
- Licence Number: MU/2024/AB123
- Risk Level: Low (green badge)
- Compliance Status: COMPLIANT (green badge)

**Mock Data**:
- All scans return VALID status
- Driver: John Smith (DRV-001)
- Used for demonstration purposes

---

## 🔧 ADMIN ROLE - 6 PAGES

### 1. **Admin Dashboard** (`/app/admin/dashboard`)
**Purpose**: System-wide monitoring and analytics

**Analytics Cards** (4 metrics):
1. **Total Drivers**: 850 (+12 this week) ↑
2. **High Risk Drivers**: 120 (-8 from last month) ↑
3. **Active Passports**: 823 (96.8% active) ↑
4. **Verification Requests**: 1,245 (+23% this month) ↑

**Charts**:

1. **Suspension Risk Distribution** (Pie Chart)
   - Low Risk: 450 (53%)
   - Medium Risk: 280 (33%)
   - High Risk: 120 (14%)

2. **Average Behaviour Risk Trend** (Line Chart)
   - 7 months data (Sep-Mar)
   - Decreasing trend: 35 → 22
   - Indigo line color (#4F46E5)

**Top Risk Factors** (Explainable AI):
1. Current Points: 92% impact
2. Severe Offences: 85% impact
3. Offences Last 12 Months: 78% impact
4. Previous Suspensions: 65% impact
5. Licence Duration: 42% impact

---

### 2. **Driver Search** (`/app/admin/search`)
**Purpose**: Search and view individual driver records

**Search Functionality**:
- Search by driver name or ID
- Real-time filtering
- Search input with magnifying glass icon

**Driver Table** (5 mock drivers):

1. **John Smith (DRV-001)**
   - Licence: MU/2024/AB123
   - Risk: Low (15%) - Green
   - Compliance: COMPLIANT - Green badge
   - Trust Level: High (85%)
   - Action: "View Details" → `/app/admin/driver/DRV-001`

2. **Sarah Johnson (DRV-002)**
   - Licence: MU/2024/CD456
   - Risk: Medium (45%) - Yellow
   - Compliance: REVIEW - Yellow badge
   - Trust Level: Medium (62%)
   - Action: "View Details" → `/app/admin/driver/DRV-002`

3. **Michael Chen (DRV-003)**
   - Licence: MU/2024/EF789
   - Risk: High (78%) - Red
   - Compliance: AT RISK - Red badge
   - Trust Level: Low (35%)
   - Action: "View Details" → `/app/admin/driver/DRV-003`

4. **Emily Williams (DRV-004)**
   - Licence: MU/2024/GH012
   - Risk: Low (22%) - Green
   - Compliance: COMPLIANT - Green badge
   - Trust Level: High (78%)
   - Action: "View Details" → `/app/admin/driver/DRV-004`

5. **David Brown (DRV-005)**
   - Licence: MU/2024/IJ345
   - Risk: Medium (56%) - Yellow
   - Compliance: REVIEW - Yellow badge
   - Trust Level: Medium (55%)
   - Action: "View Details" → `/app/admin/driver/DRV-005`

---

### 3. **Driver Details Page** (`/app/admin/driver/:driverId`)
**Purpose**: Detailed view of individual driver (dynamic route)

**Driver Information** (for DRV-001):
- Driver ID: DRV-001
- Licence Number: MU/2024/AB123
- Compliance Status: COMPLIANT
- Trust Level: High (85%)

**AI Behaviour Risk Assessment**:
- Suspension Risk: 15% (6 months)
- Visual risk gauge

**Behaviour Metrics** (3 cards):
- Stability Index: 92% (+5% from last month)
- Days Since Last Offence: 145 (Improving)
- Behaviour Trend: Positive (Low risk trajectory)

**Behaviour Risk Trend Chart**:
- Line chart (7 months)
- Decreasing trend: 25 → 15

**Navigation**:
- Back button → `/app/admin/search`

---

### 4. **AI Behaviour Analysis** (`/app/admin/ai-analysis`)
**Purpose**: System-wide predictive analytics and insights

**AI Model Performance** (4 metrics):
- Model Accuracy: 94.2%
- Precision: 91.8%
- Recall: 89.5%
- F1 Score: 90.6%

**Charts**:

1. **Risk Level Distribution** (Pie Chart)
   - Low Risk: 450 drivers (53%)
   - Medium Risk: 280 drivers (33%)
   - High Risk: 120 drivers (14%)

2. **Offence Category Distribution** (Bar Chart)
   - Speeding: 245 offences
   - Mobile Use: 156 offences
   - No Insurance: 89 offences
   - Dangerous Driving: 67 offences
   - Other: 123 offences

3. **Suspension Probability Trends** (Line Chart)
   - 7 months data (Sep-Mar)
   - Decreasing trend: 18% → 10%

**Explainable AI - Most Influential Features**:
1. Current Points: 28% importance
2. Severe Offences Count: 22% importance
3. Offences Last 12 Months: 18% importance
4. Previous Suspensions: 15% importance
5. Years Since Licence: 9% importance
6. Age Group: 8% importance

---

### 5. **User Management** (`/app/admin/users`)
**Purpose**: Manage system users and permissions

**User Table** (4 mock users):

1. **Admin User**
   - Username: admin
   - Role: Administrator
   - Email: admin@persovault.mu
   - Status: Active (green)
   - Last Login: 2024-03-10 14:30

2. **Officer Smith**
   - Username: officer.smith
   - Role: Police Officer
   - Email: smith@police.mu
   - Status: Active (green)
   - Last Login: 2024-03-12 09:15

3. **Driver Jones**
   - Username: driver.jones
   - Role: Driver
   - Email: jones@email.com
   - Status: Active (green)
   - Last Login: 2024-03-13 08:45

4. **Test User**
   - Username: test.user
   - Role: Driver
   - Email: test@email.com
   - Status: Inactive (gray)
   - Last Login: Never

**Actions per user**:
- Edit button (blue)
- Delete button (red)

**Add New User Button**:
- Top-right corner
- Opens user creation form

---

### 6. **System Logs** (`/app/admin/logs`)
**Purpose**: View system activity and audit trail

**Log Filters**:
- Date range picker
- Log level filter (All, Info, Warning, Error)
- Search by user or action

**Log Entries Table** (10 mock logs):

1. **2024-03-13 09:45:23**
   - Level: INFO (blue)
   - User: officer.smith
   - Action: Passport Verification
   - Details: Verified DRV-001 passport - Status: VALID
   - IP: 192.168.1.100

2. **2024-03-13 09:30:15**
   - Level: INFO (blue)
   - User: driver.jones
   - Action: Login
   - Details: Successful driver login
   - IP: 192.168.1.101

3. **2024-03-13 09:15:42**
   - Level: WARNING (yellow)
   - User: admin
   - Action: User Permission Change
   - Details: Modified permissions for officer.smith
   - IP: 192.168.1.1

4. **2024-03-13 08:55:33**
   - Level: ERROR (red)
   - User: system
   - Action: Failed Login Attempt
   - Details: Invalid credentials for user: unknown.user
   - IP: 203.0.113.45

5. **2024-03-12 18:20:11**
   - Level: INFO (blue)
   - User: driver.jones
   - Action: Passport Refresh
   - Details: Digital behaviour passport regenerated
   - IP: 192.168.1.101

6. **2024-03-12 16:45:22**
   - Level: INFO (blue)
   - User: admin
   - Action: Report Generated
   - Details: Monthly compliance report created
   - IP: 192.168.1.1

7. **2024-03-12 14:30:18**
   - Level: WARNING (yellow)
   - User: system
   - Action: High Risk Alert
   - Details: Driver DRV-003 exceeded 75% risk threshold
   - IP: system

8. **2024-03-12 11:20:45**
   - Level: INFO (blue)
   - User: officer.smith
   - Action: Passport Verification
   - Details: Verified DRV-002 passport - Status: VALID
   - IP: 192.168.1.100

9. **2024-03-11 16:05:33**
   - Level: INFO (blue)
   - User: admin
   - Action: User Created
   - Details: New driver account created: DRV-006
   - IP: 192.168.1.1

10. **2024-03-11 10:12:22**
    - Level: ERROR (red)
    - User: system
    - Action: Database Sync Error
    - Details: Failed to sync with external penalty point system
    - IP: system

**Export Functionality**:
- "Export Logs" button
- CSV/PDF options

---

## 🎨 DESIGN & FEATURES

### Color Scheme (VISUX Creative Palette):
- **Light Mode Primary**: #4F46E5 (Indigo)
- **Dark Mode Primary**: #6366F1 (Lighter Indigo)
- **Credentials**: Black/White gradient (inverts in dark mode)

### Global Features:
1. **Dark/Light Mode Toggle**
   - Available on all pages
   - Persistent across sessions
   - Sun/Moon icon in header

2. **Responsive Design**
   - Desktop, Tablet, Mobile optimized
   - Card-based layouts
   - Touch-friendly controls

3. **Navigation**
   - Role-based sidebar navigation
   - Active page highlighting
   - Logout functionality

4. **Security**
   - QR code verification
   - Government-grade encryption messaging
   - Access logging

5. **Charts & Analytics**
   - Recharts library
   - Pie charts, Line charts, Bar charts
   - Risk gauges
   - Progress bars

### Technology Stack:
- **Framework**: React 18.3.1
- **Router**: react-router 7.13.0
- **Styling**: Tailwind CSS 4.1.12
- **Charts**: Recharts 2.15.2
- **QR Codes**: qrcode.react 4.2.0
- **QR Scanner**: react-qr-reader 3.0.0-beta-1
- **Icons**: Lucide React 0.487.0
- **Build**: Vite 6.3.5
- **Language**: TypeScript

---

## 🗺️ COMPLETE ROUTE MAP

### Public Routes:
- `/` - Landing Page (with features showcase)
- `/login` - Login Page (role selection)

### Driver Routes (`/app/driver/*`):
- `/app/driver/dashboard` - Driver Dashboard
- `/app/driver/wallet` - Identity Wallet
- `/app/driver/nic` - Digital National ID Card
- `/app/driver/licence` - Digital Driving Licence
- `/app/driver/travel-passport` - Digital Travel Passport
- `/app/driver/passport` - Digital Behaviour Passport
- `/app/driver/penalty-points` - Penalty Points History

### Police Routes (`/app/police/*`):
- `/app/police/verification` - Verification Console

### Admin Routes (`/app/admin/*`):
- `/app/admin/dashboard` - Admin Dashboard
- `/app/admin/search` - Driver Search
- `/app/admin/driver/:driverId` - Driver Details (Dynamic)
- `/app/admin/ai-analysis` - AI Behaviour Analysis
- `/app/admin/users` - User Management
- `/app/admin/logs` - System Logs

### Total Pages: **17 pages** (15 static + 1 dynamic route + 1 landing)

---

## 📊 MOCK DATA SUMMARY

### Drivers:
- **Total**: 5 drivers in system
- **Active**: All 5 active
- **Risk Distribution**: 2 Low, 2 Medium, 1 High

### Penalty Points:
- **Active**: 3 violations (8 points total)
- **Expired**: 2 violations (6 points)
- **Time Range**: 2020-2024

### System Metrics:
- **Total Drivers**: 850
- **High Risk**: 120
- **Active Passports**: 823
- **Verifications**: 1,245

### AI Model:
- **Accuracy**: 94.2%
- **Training**: 850 driver dataset
- **Risk Factors**: 6 primary features

---

## 🔒 SECURITY FEATURES

1. **QR Code Verification**
   - Unique tokens per credential
   - Time-limited validity (24 hours for behaviour passport)
   - Tamper detection

2. **Access Control**
   - Role-based permissions
   - Authenticated routes
   - Session management

3. **Audit Trail**
   - All actions logged
   - IP tracking
   - User identification
   - Timestamp recording

4. **Data Protection**
   - Government-grade messaging
   - Encryption references
   - Secure credential display

---

## 📱 RESPONSIVE BREAKPOINTS

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All pages fully responsive with:
- Collapsible navigation
- Stacked cards on mobile
- Touch-optimized buttons
- Readable font sizes

---

## 🎯 KEY FEATURES BY ROLE

### Driver:
✅ View personal dashboard with AI risk assessment  
✅ Access 4 digital credentials (NIC, Licence, Travel Passport, Behaviour Passport)  
✅ View detailed penalty points history  
✅ Monitor compliance status  
✅ Track behaviour trends  
✅ Generate/refresh behaviour passport  

### Police:
✅ Scan QR codes with device camera  
✅ Verify driver behaviour passports  
✅ Manual token verification  
✅ View driver compliance summary  
✅ Real-time verification status  

### Admin:
✅ Monitor system-wide analytics  
✅ Search and view all drivers  
✅ Access AI behaviour analysis  
✅ Manage users and permissions  
✅ View system logs and audit trail  
✅ Track risk distributions  
✅ Analyze compliance trends  

---

*Last Updated: March 13, 2026*  
*System Version: 1.0.0*  
*Total Implementation: 17 pages across 3 user roles*

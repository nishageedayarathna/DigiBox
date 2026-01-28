# 🎯 DigiBox - Micro Donation Platform with Trust ans Transparancy

A comprehensive digital fundraising platform designed to streamline cause creation, verification, and donation processes with multi-role support and professional document generation.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-14.0+-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Performance Optimizations](#performance-optimizations)
- [Contributing](#contributing)
- [Support](#support)

---

## ✨ Features

### Core Functionality
- **Multi-Role System**: Creator, Admin, Grama Seva (GS) Officer, Divisional Secretary (DS) Officer, Donor
- **Cause Management**: Create, edit, and track fundraising causes
- **Beneficiary NIC Validation**: Sri Lankan NIC validation (12 digits or 9 digits + V/X)
- **Evidence Upload**: PDF-only document upload (2MB limit) with comprehensive requirements
- **Donation System**: Browse causes, donate, and track donation history
- **Professional Documents**: Auto-generated PDF certificates for approvals with DigiBox branding

### Administrative Features
- **Admin Dashboard**: Monitor all causes and approval statuses
- **GS Verification**: Area-level cause verification and approval
- **DS Final Approval**: Division-level final approval with official certificates
- **User Management**: Create and manage GS/DS officers
- **Status Tracking**: Real-time cause status updates through approval workflow

### User Experience
- **Role-Based Navigation**: Customized dashboards and menus per user role
- **Performance Optimized**: MongoDB indexes and parallel queries for fast load times
- **Responsive Design**: Modern dark theme UI with purple/indigo color scheme
- **Email Notifications**: Automated email updates on cause status changes
- **Profile Management**: User profile updates and password reset functionality

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Tailwind CSS** 3.4.18 - Styling
- **React Router** 6.8.0 - Client-side routing
- **Axios** 1.12.2 - HTTP client
- **jsPDF** 4.0.0 - PDF generation
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** & **Express** 5.1.0 - Server framework
- **MongoDB** & **Mongoose** 8.19.2 - Database
- **JWT** 9.0.2 - Authentication
- **Bcryptjs** - Password hashing
- **Multer** 2.0.2 - File upload handling
- **Nodemailer** - Email service

### Database
- **MongoDB** - NoSQL database with performance indexes

---

## 📁 Project Structure

```
DigiBox/
├── backend/
│   ├── index.js                 # Server entry point
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── userModel.js        # User schema
│   │   ├── causeModel.js       # Cause schema with indexes
│   │   ├── donationModel.js    # Donation schema
│   │   ├── DistrictModel.js    # Administrative divisions
│   │   ├── DivisionModel.js
│   │   └── GSAreaModel.js
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication
│   │   ├── causeRoutes.js      # Cause CRUD & analytics
│   │   ├── adminRoutes.js      # Admin operations
│   │   ├── gsRoutes.js         # GS officer approvals
│   │   ├── dsRoutes.js         # DS officer approvals
│   │   ├── donorRoutes.js      # Donor operations
│   │   ├── dashboardRoutes.js  # Dashboard stats
│   │   └── profileRoutes.js    # Profile management
│   ├── controllers/
│   │   └── adminController.js  # Admin logic
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── utils/
│   │   └── email.js            # Email service
│   └── uploads/                # File storage

├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── logo.png
│   │       └── images/
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css           # Global styles
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── BarChartView.jsx
│   │   │   │   ├── PieChartView.jsx
│   │   │   │   ├── RecentList.jsx
│   │   │   │   └── [other dashboard components]
│   │   │   ├── FormCard.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── SubmitButton.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ApproveCauses.jsx
│   │   │   │   ├── PublishCauses.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   └── AddOfficer.jsx
│   │   │   ├── creator/
│   │   │   │   ├── CreatorDashboard.jsx
│   │   │   │   ├── CreateCause.jsx
│   │   │   │   └── MyCauses.jsx
│   │   │   ├── gs/
│   │   │   │   ├── GSDashboard.jsx
│   │   │   │   ├── PendingCauses.jsx
│   │   │   │   └── Documents.jsx
│   │   │   ├── ds/
│   │   │   │   ├── DSDashboard.jsx
│   │   │   │   ├── DSPendingCauses.jsx
│   │   │   │   └── DSDocuments.jsx
│   │   │   └── donor/
│   │   │       ├── DonorDashboard.jsx
│   │   │       ├── BrowseCauses.jsx
│   │   │       ├── CauseDetails.jsx
│   │   │       ├── Donate.jsx
│   │   │       ├── DonationHistory.jsx
│   │   │       └── CompletedCauses.jsx
│   │   └── services/
│   │       ├── donorService.js
│   │       ├── gsService.js
│   │       └── dsService.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js

└── README.md
```

---

## 💻 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/DigiBox.git
cd DigiBox/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digibox
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digibox

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Credentials (auto-created)
ADMIN_EMAIL=admin@digibox.com
ADMIN_PASSWORD=Admin@123
```

4. **Start the backend server**
```bash
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file (if needed)**
```env
REACT_APP_API_URL=http://localhost:5000
```

4. **Start the development server**
```bash
npm start
```

App runs on `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/digibox

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin User
ADMIN_EMAIL=admin@digibox.com
ADMIN_PASSWORD=Admin@123
```

### Database Configuration

The application uses MongoDB with performance indexes:

**Cause Collection Indexes:**
- `{ creator: 1, createdAt: -1 }` - Creator causes by date
- `{ creator: 1, dsStatus: 1 }` - Creator causes by DS status
- `{ creator: 1, adminStatus: 1, gsStatus: 1, dsStatus: 1 }` - Composite index for filtering
- `{ creator: 1, createdAt: 1, dsStatus: 1 }` - Combined query optimization

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Creates optimized build in /build directory
```

---

## 📡 API Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Cause Endpoints
- `POST /api/cause/create` - Create cause with evidence
- `GET /api/cause/my-causes` - Get user's causes
- `GET /api/cause/stats` - Get cause statistics
- `GET /api/cause/analytics/monthly` - Monthly analytics
- `PUT /api/cause/gs-approve/:id` - GS approval
- `PUT /api/cause/ds-approve/:id` - DS approval

### Admin Endpoints
- `GET /api/admin/analytics` - Admin dashboard stats
- `GET /api/admin/causes` - All causes (filterable)
- `GET /api/admin/analytics/pie` - Approval distribution

### GS Officer Endpoints
- `GET /api/gs/dashboard` - GS dashboard data
- `GET /api/gs/pending-causes` - Pending causes for GS
- `PUT /api/gs/approve/:id` - Approve cause
- `PUT /api/gs/reject/:id` - Reject cause
- `GET /api/gs/documents` - GS documents

### DS Officer Endpoints
- `GET /api/ds/dashboard` - DS dashboard data
- `GET /api/ds/pending-causes` - Pending causes for DS
- `PUT /api/ds/approve/:id` - Final approval
- `PUT /api/ds/reject/:id` - Reject cause
- `GET /api/ds/documents` - DS documents

### Donor Endpoints
- `GET /api/donor/summary` - Dashboard summary
- `GET /api/donor/browse` - Browse all causes
- `POST /api/donor/donate` - Make donation
- `GET /api/donor/history` - Donation history

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/reset-password` - Change password
- `PUT /api/profile/upload-image` - Upload profile image

---

## 👥 User Roles

### 1. **Creator**
- Create fundraising causes
- Upload evidence (NIC, documents, bank statement)
- Track cause status through approval workflow
- View donation progress
- Manage profile

**Approval Flow:** Creator → Admin → GS → DS → Published

### 2. **Admin**
- Review all submitted causes
- Initial approval/rejection
- View approval distribution analytics
- Add GS/DS officers
- Manage users

### 3. **Grama Seva (GS) Officer**
- Verify causes at grassroots level
- Review beneficiary details and evidence
- Approve/reject causes
- Generate verification certificates
- View area-specific analytics

### 4. **Divisional Secretary (DS) Officer**
- Provide final approval for causes
- Review GS officer verification
- Generate final approval certificates
- View division-wide analytics

### 5. **Donor**
- Browse all approved causes
- Donate to causes
- Track donation history
- View completed causes
- Manage profile and donations

---

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  role: ['creator', 'admin', 'gs', 'ds', 'donor'],
  profileImage: String,
  // For GS Officers
  areaCode: String,
  areaName: String,
  districtCode: String,
  districtName: String,
  divisionCode: String,
  divisionName: String,
  createdAt: Date
}
```

### Cause Model
```javascript
{
  creator: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  requiredAmount: Number,
  fundsRaised: Number (default: 0),
  donorsCount: Number (default: 0),
  
  // Beneficiary
  beneficiaryName: String,
  beneficiaryContact: String,
  beneficiaryNIC: String,
  beneficiaryAddress: String,
  beneficiaryBank: String,
  beneficiaryAccountName: String,
  beneficiaryAccountNumber: String,
  beneficiaryBranch: String,
  
  // Location
  areaCode: String,
  areaName: String,
  divisionName: String,
  districtName: String,
  
  // Files
  evidenceFile: String,
  evidenceFileType: String,
  gsDocument: String,
  dsDocument: String,
  
  // Status
  adminStatus: ['pending', 'approved', 'rejected'],
  gsStatus: ['pending', 'approved', 'rejected'],
  dsStatus: ['pending', 'approved', 'rejected'],
  finalStatus: String,
  
  // Officers
  gsOfficer: ObjectId (ref: User),
  dsOfficer: ObjectId (ref: User),
  
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Model
```javascript
{
  donor: ObjectId (ref: User),
  cause: ObjectId (ref: Cause),
  amount: Number,
  transactionId: String,
  status: ['pending', 'completed', 'failed'],
  paymentMethod: String,
  createdAt: Date
}
```

---

## ⚡ Performance Optimizations

### Database Optimization
1. **MongoDB Indexes**: Compound indexes for frequently queried creator operations
2. **Query Optimization**: Using `.lean()` for read-only operations
3. **Field Selection**: Using `.select()` to limit returned fields
4. **Parallel Queries**: Using `Promise.all()` for independent database calls

### Frontend Optimization
1. **Code Splitting**: React Router lazy loading for pages
2. **Image Optimization**: Compressed logo and assets
3. **Bundle Size**: Minified production builds with Tailwind CSS purging
4. **Caching**: Browser caching for static assets

### Expected Performance
- **Creator Dashboard Load**: < 3 seconds
- **Cause Query**: < 500ms
- **PDF Generation**: < 1 second

---

## 🔒 Security Features

- **Password Hashing**: Bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **File Validation**: PDF-only uploads with 2MB size limit
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured for localhost development
- **Environment Variables**: Sensitive data in .env files

---

## 📝 File Upload

### Evidence Upload Requirements
Files must be combined into a **single PDF** (max 2MB) containing:
1. **Both sides of NIC** - Clear photos of front and back
2. **Valid evidence documents** - Medical reports, bills, certificates
3. **Bank statement** - Front page of beneficiary's bank book

### Supported Formats
- PDF only (.pdf)

### Size Limits
- Maximum: 2 MB per file
- Backend: 100 MB payload limit for PDF documents

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@digibox.com
- Documentation: [Project Wiki]

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Development Team** - Initial work and ongoing maintenance

---

## 🎉 Acknowledgments

- MongoDB for the database
- React community for the frontend framework
- Express.js for the backend framework
- All contributors and testers

---

**Last Updated:** January 28, 2026  
**Version:** 1.0.0

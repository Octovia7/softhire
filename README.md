﻿# SoftHire

A scalable recruitment and sponsorship management platform for organizations and candidates, built with Node.js, Express, and MongoDB.

---

## 🎯 Purpose

SoftHire streamlines the hiring and sponsorship process for organizations and candidates by providing:

- End-to-end job posting and application management
- Multi-role authentication (candidates, recruiters)
- Sponsorship and visa application workflows
- Integrated document management and payments
- Real-time chat and notifications

---

## 🏗️ Architecture

The project follows a modular, layered architecture for maintainability and scalability:

```
softhire/
├── config/                     # Authentication and environment config
│   └── passport.js             # Google OAuth setup (serialization/deserialization)
│
├── controllers/                # Handles business logic for routes
│   ├── applicationController.js       # Job application submit/status/list
│   ├── authController.js              # User signup, OTP verify, login/logout/reset
│   ├── chat.controller.js             # Manages chat endpoints (via sockets)
│   ├── consultController.js           # Handles org consultation requests
│   ├── contactController.js           # Contact form handling
│   ├── demoController.js              # Demo scheduling, reCAPTCHA, notifications
│   ├── documentController.js          # Document upload/retrieval/deletion
│   ├── googleAuthController.js        # Google login and recruiter onboarding
│   ├── iscController.js               # Immigration Skills Charge endpoints
│   ├── jobController.js               # Job creation, updating, application
│   ├── jobExpectationController.js    # Candidate job expectations
│   ├── jobPreferenceController.js     # Candidate job preferences
│   ├── orgController.js               # Recruiter job posting, stats, profile
│   ├── profileController.js           # Candidate profile CRUD and search
│   ├── sponsorshipController.js       # Sponsorship app sections and docs
│   └── stripe.js                      # Stripe payment sessions + webhook handling
│
├── middleware/                # Auth and validation logic
│   ├── authMiddleware.js             # JWT auth, recruiter/candidate protection
│   ├── authorizeAdmin.js             # (Reserved for future admin features)
│   └── isVerifiedOrg.js              # Ensures user belongs to verified org
│
├── models/                    # MongoDB (Mongoose) schemas
│   ├── AboutYourCompany.js           # Sponsorship: company details
│   ├── ActivityAndNeeds.js           # Sponsorship: business activity
│   ├── Application.js                # Job application (candidate, job, status)
│   ├── AuthorisingOfficer.js         # Sponsorship: officer info
│   ├── Candidate.js                  # Candidate-specific data
│   ├── CompanyStructure.js           # Sponsorship: structure info
│   ├── ConsultRequest.js             # Org consultation requests
│   ├── Declarations.js               # Sponsorship: declaration section
│   ├── GettingStarted.js             # Sponsorship: getting started section
│   ├── Job.js                        # Job post: title, description, salary, etc.
│   ├── JobExpectations.js            # Candidate job expectations
│   ├── JobPreferences.js             # Candidate job preferences
│   ├── Organization.js               # Organization metadata
│   ├── PendingUser.js                # Pre-verification user temp data
│   ├── Profile.js                    # Candidate resume, education, experience
│   ├── Recruiter.js                  # Recruiter-specific data
│   ├── ScheduleDemo.js               # Demo scheduling metadata
│   ├── SponsorEligibility.js         # Sponsor eligibility submission schema
│   ├── SponsorshipApplication.js     # Full sponsorship workflow (refs sections)
│   ├── SupportingDocuments.js        # Uploaded sponsorship documents
│   ├── SystemAccess.js               # Sponsorship: level 1 access details
│   └── User.js                       # Main user model (all roles)
│
├── public/                    # Static assets (e.g., images, frontend docs)
│
├── routes/                    # All API endpoint definitions
│   ├── applicationRoutes.js          # Apply, track, list jobs
│   ├── authRoutes.js                 # Signup, login, OTP, password reset
│   ├── contactRoutes.js              # Contact form endpoint
│   ├── consult.js                    # Request consultation endpoint
│   ├── demo.js                       # Schedule demo endpoints
│   ├── documentRoutes.js             # Resume/document upload routes
│   ├── googleAuthRoutes.js           # Google login route
│   ├── isc.js                        # Immigration Skills Charge routes
│   ├── jobExpectationRoutes.js       # Candidate job expectation routes
│   ├── jobPreferenceRoutes.js        # Candidate job preference routes
│   ├── jobRoutes.js                  # Create, edit, list jobs
│   ├── orgRoutes.js                  # Org dashboard, stats, recruiters
│   ├── profile.js                    # Candidate profile CRUD and search
│   ├── salaryRoutes.js               # Salary + SOC code endpoints
│   ├── sponsorEligibilityRoutes.js   # Sponsor eligibility form routes
│   ├── sponsorLicenceRoutes.js       # Sponsor licence workflow
│   ├── sponsorshipRoutes.js          # Multi-step sponsorship routes
│   ├── stripe.js                     # Stripe payments + webhook endpoint
│   └── userRoutes.js                 # Candidate/recruiter dashboard APIs
│
├── sockets/                   # Real-time communication
│   └── chat.js                       # Socket.IO chat server logic
│
├── uploads/                   # Resume/doc upload destination
│   └── (files stored here)
│
├── utils/                     # Helper utilities
│   ├── mailer.js                     # Email sending utility
│   ├── multer.js                     # Generic multer config
│   ├── resumeMulter.js               # Resume upload middleware
│   ├── scheduleDemoEmailTemplate.js  # Email template for demos
│   ├── transporter.js                # Nodemailer SMTP config
│   ├── uploadDocument.js             # Doc upload config for sponsorship
│   └── uploadPassport.js             # Passport upload config
│
├── .env                      # Secret configuration (JWTs, keys, DB)
├── .gitignore                # Prevents secrets/node_modules from being committed
├── package.json              # Dependencies and scripts
├── README.md                 # You’re reading it!
├── seedAdmin.js              # Seeds default admin into DB (for future use)
└── server.js                 # App entry point, connects DB, sets up Express, routes
```

> **Note:** Admin features and endpoints are under development and will be documented in future releases. This README currently covers recruiter and candidate functionality only.

---

## 🚀 Features

### Organization Management

- ✅ Organization registration and onboarding
- ✅ Organization dashboard and recruiter management

### Job & Application Management

- ✅ Job posting, editing, and listing
- ✅ Candidate job search and application
- ✅ Application status tracking

### Sponsorship & Visa Workflow

- ✅ Multi-section sponsorship application (company, officers, eligibility, etc.)
- ✅ Document upload and management
- ✅ Visa application tracking

### User & Profile Management

- ✅ Candidate and recruiter registration/login (email, Google OAuth)
- ✅ OTP verification and password reset
- ✅ Profile creation, editing, and search

### Payments & Billing

- ✅ Stripe integration for sponsorship and candidate payments
- ✅ Webhook handling for payment status

### Communication

- ✅ Real-time chat between candidates and recruiters
- ✅ Email notifications for key events

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Google OAuth (Passport.js)
- **Payments:** Stripe
- **File Uploads:** Multer
- **Email:** Nodemailer
- **Real-time:** Socket.IO
- **Testing:** Jest, Supertest (recommended)

---

## 📋 Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- npm

---

## ⚡ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd softhire

# Install dependencies
npm install
```

## 2.  Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Server
PORT=5000                                 # Port for the Express server

# Database
MONGO_URI=your_mongodb_connection_string  # MongoDB connection string

# JWT & Session
JWT_SECRET=your_jwt_secret                # Secret for JWT signing
SESSION_SECRET=your_session_secret        # Secret for session management

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# URLs
SERVER_URL=https://your-backend-url.com   # Public server URL (for callbacks, emails, etc.)
CLIENT_URL=https://your-frontend-url.com  # Frontend/client app URL

# Email (Nodemailer)
EMAIL=your_email_address                  # Email address for sending notifications
EMAIL_PASSWORD=your_email_app_password    # Email password or app-specific password

# OTP
OTP_EXPIRY_MINUTES=10                     # OTP expiry time in minutes

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Cloudinary (File uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_CANDIDATE_WEBHOOK_SECRET=your_stripe_candidate_webhook_secret

# CORS
CORS_ORIGIN=http://localhost:5173,https://your-frontend-url.com

# Contact
CLIENT_CONTACT_EMAIL=contact@yourdomain.com

# (Optional) Admin credentials for seeding (not used in public APIs)
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# Node environment
NODE_ENV=development
```

**Descriptions:**

- **PORT**: Port on which the backend server runs.
- **MONGO_URI**: MongoDB connection string for your database.
- **JWT_SECRET**: Used to sign and verify JWT tokens for authentication.
- **SESSION_SECRET**: Used for session management (e.g., with Passport.js).
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL**: For Google OAuth login.
- **SERVER_URL / CLIENT_URL**: URLs for backend and frontend, used in OAuth, emails, and CORS.
- **EMAIL / EMAIL_PASSWORD**: Credentials for sending emails (e.g., password resets, notifications).
- **OTP_EXPIRY_MINUTES**: How long OTPs are valid for.
- **RECAPTCHA_SECRET_KEY**: Google reCAPTCHA secret for bot/spam protection.
- **CLOUDINARY_* variables**: For uploading and managing files (resumes, documents, etc.) via Cloudinary.
- **STRIPE_* variables**: For Stripe payment integration and webhook verification.
- **CORS_ORIGIN**: Comma-separated list of allowed origins for CORS.
- **CLIENT_CONTACT_EMAIL**: Contact email shown to users or used in notifications.
- **ADMIN_EMAIL / ADMIN_PASSWORD**: Used for seeding an admin user (not for public API).
- **NODE_ENV**: Set to `development` or `production` as appropriate.

> ⚠️ **Never commit your `.env` file to version control.**  
> Always keep your secrets safe!

---

**Tip:**  
Update the values to match your deployment and credentials.  
If you add new features that require more environment variables, document them here for your team!

### 3. Start MongoDB

```bash
# Local MongoDB
mongod
```

### 4. Run the Application

```bash
node server.js
```

### 5. Access the API

- **API Base URL:** http://localhost:5000/
- **API Documentation:** (Add Swagger or Postman collection as needed)

---

## 📚 API Overview

### Authentication

- `POST /api/auth/signup` – Candidate/Recruiter signup
- `POST /api/auth/login` – Login with email/password
- `POST /api/auth/google` – Google OAuth login
- `POST /api/auth/verify-otp` – OTP verification
- `POST /api/auth/reset-password` – Password reset

### Organization

- `POST /api/org/register` – Register new organization
- `GET /api/org/profile` – Get organization profile
- `PUT /api/org/profile` – Update organization profile
- `GET /api/org/jobs` – List jobs posted by organization
- `GET /api/org/recruiters` – List recruiters in organization

### Jobs & Applications

- `POST /api/org/jobs` – Post a new job
- `PUT /api/org/jobs/:jobId` – Update a job
- `DELETE /api/org/jobs/:jobId` – Delete a job
- `GET /api/jobs` – List all jobs
- `GET /api/jobs/:jobId` – Get job details
- `POST /api/jobs/:jobId/apply` – Apply to a job
- `GET /api/applications` – List applications for current user
- `GET /api/org/applications` – List applications for organization’s jobs

### Candidate Profile

- `GET /api/profile` – Get candidate profile
- `POST /api/profile` – Create candidate profile
- `PUT /api/profile` – Update candidate profile
- `GET /api/profile/search` – Search candidate profiles

### Job Preferences & Expectations

- `GET /api/job-preferences` – Get job preferences
- `POST /api/job-preferences` – Set job preferences
- `PUT /api/job-preferences` – Update job preferences

- `GET /api/job-expectations` – Get job expectations
- `POST /api/job-expectations` – Set job expectations
- `PUT /api/job-expectations` – Update job expectations

### Sponsorship

- `POST /api/sponsorship/apply` – Start sponsorship application
- `GET /api/sponsorship/:id` – Get sponsorship application by ID
- `PUT /api/sponsorship/:id/section` – Update a section of the sponsorship application
- `POST /api/sponsorship/:id/documents` – Upload supporting documents
- `GET /api/sponsorship/:id/documents` – List supporting documents
- `DELETE /api/sponsorship/:id/documents/:docId` – Delete a supporting document
- `GET /api/sponsorship` – List all sponsorship applications for user/org

### Sponsor Eligibility

- `POST /api/sponsor-eligibility` – Submit sponsor eligibility form
- `GET /api/sponsor-eligibility/:id` – Get sponsor eligibility submission

### Consultations & Demos

- `POST /api/consult` – Request a consultation
- `POST /api/demo` – Schedule a product demo

### Documents

- `POST /api/documents/upload` – Upload a document (resume, passport, etc.)
- `GET /api/documents/:id` – Download a document
- `DELETE /api/documents/:id` – Delete a document

### Payments

- `POST /api/payments/stripe/session` – Create Stripe payment session
- `POST /api/payments/stripe/webhook` – Stripe webhook endpoint

### Communication

- `GET /api/chat/conversations` – List chat conversations
- `GET /api/chat/:conversationId/messages` – Get messages in a conversation
- `POST /api/chat/:conversationId/messages` – Send a message

### Miscellaneous

- `POST /api/contact` – Submit a contact form
- `GET /api/isc` – Get Immigration Skills Charge info
- `GET /api/salary` – Get salary/SOC code info

---

## 🔒 Security Features

- ✅ JWT authentication and role-based access
- ✅ Input validation and error handling
- ✅ Secure file uploads

---


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


## 🆘 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running and URI is correct in `.env`

**Import Errors:**
- Ensure `node_modules` is installed (`npm install`)
- Check your Node.js version

**Email/Stripe Issues:**
- Check credentials in `.env`
- Review logs for error details

---

## 📞 Support

- Create an issue in the repository
- Review API documentation and logs
- Contact maintainers as needed

---

**Built with ❤️ for global hiring and sponsorship workflows**

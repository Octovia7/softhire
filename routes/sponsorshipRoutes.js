const express = require("express");
const router = express.Router();
const uploadPassport = require("../utils/uploadPassport");

const {
  createSponsorshipApplication,
  updateGettingStarted,
  updateAboutYourCompany,
  getSponsorshipApplicationById,updateCompanyStructure,updateActivityAndNeeds,updateAuthorisingOfficers,updateSystemAccess,uploadSupportingDocuments,submitOrUpdateDeclarations,updateOrganizationSize,submitApplication
  ,getGettingStarted,getAboutYourCompany,getCompanyStructure,getActivityAndNeeds,getAuthorisingOfficer,getSystemAccess,getSupportingDocuments,getOrganizationSize,getDeclarations,getApplicationProgress,uploadSingleSupportingDocument} = require("../controllers/sponsorshipController");

const { authenticate, authorizeRecruiter } = require("../middleware/authMiddleware");
const upload = require("../utils/uploadDocument");
router.get("/:id/progress", authenticate, authorizeRecruiter, getApplicationProgress);

// GET APIs per section
router.get("/:id/getting-started", authenticate, authorizeRecruiter, getGettingStarted);
router.get("/:id/about-your-company", authenticate, authorizeRecruiter, getAboutYourCompany);
router.get("/:id/company-structure", authenticate, authorizeRecruiter, getCompanyStructure);
router.get("/:id/activity-and-needs", authenticate, authorizeRecruiter, getActivityAndNeeds);
router.get("/:id/authorising-officer", authenticate, authorizeRecruiter, getAuthorisingOfficer);
router.get("/:id/system-access", authenticate, authorizeRecruiter, getSystemAccess);
router.get("/:id/supporting-documents", authenticate, authorizeRecruiter, getSupportingDocuments);
router.get("/:id/organization-size", authenticate, authorizeRecruiter, getOrganizationSize);
router.get("/:id/declarations", authenticate, authorizeRecruiter, getDeclarations);
router.post("/application/:id/submit", authenticate, authorizeRecruiter, submitApplication);
router.patch(
  "/application/:id/organization-size",
  authenticate,
  authorizeRecruiter,
  updateOrganizationSize
);

router.patch(
  "/application/:id/declarations",
  authenticate,
  authorizeRecruiter,
  submitOrUpdateDeclarations
);

// Multer expects .fields for multiple file fields
router.patch(
  '/application/:id/supporting-documents/upload-one',
  authenticate,
  authorizeRecruiter,
  upload.single("file"),
  uploadSingleSupportingDocument
);
router.patch(
  '/application/:id/supporting-documents',
  authenticate,
  authorizeRecruiter,
  upload.fields([
    { name: "authorisingOfficerPassport" },
    { name: "authorisingOfficerBRP" },
    { name: "letterOfRejection" },
    { name: "letterOfRevocation" },
    { name: "recruitersAuthority" },
    { name: "auditedAnnualAccounts" },
    { name: "certificateOfIncorporation" },
    { name: "businessBankStatement" },
    { name: "employersLiabilityInsurance" },
    { name: "governingBodyRegistration" },
    { name: "franchiseAgreement" },
    { name: "serviceUserAgreements" },
    { name: "vatRegistration" },
    { name: "payeConfirmation" },
    { name: "businessPremiseProof" },
    { name: "hmrcTaxReturns" },
    { name: "currentVacancies" },
    { name: "tenderAgreements" },
    { name: "orgChart" },
    { name: "rightToWorkChecks" },
    { name: "additionalDocuments" }
  ]),
  uploadSupportingDocuments
);


router.patch(
  "/:id/activity-needs",
  authenticate,
  authorizeRecruiter,
  uploadPassport.single("passport"), // field name = "passport"
  updateActivityAndNeeds
);

// PATCH: Update System Access
router.patch("/:id/system-access", authenticate, authorizeRecruiter, updateSystemAccess);
router.patch("/:id/authorising-officer",authenticate, authorizeRecruiter,updateAuthorisingOfficers);

// 🔹 POST: Start sponsorship application (creates empty shell)
router.post("/", authenticate, authorizeRecruiter, createSponsorshipApplication);

// 🔹 GET: Fetch a sponsorship application by ID (optional utility)
router.get("/:id", authenticate, authorizeRecruiter, getSponsorshipApplicationById);

// 🔹 PATCH: Update "Getting Started" section
router.patch("/:id/getting-started", authenticate, authorizeRecruiter, updateGettingStarted);

// 🔹 PATCH: Update "About Your Company" section
router.patch("/:id/about-your-company", authenticate, authorizeRecruiter, updateAboutYourCompany);
router.patch("/:id/company-structure", authenticate, authorizeRecruiter, updateCompanyStructure);



module.exports = router;

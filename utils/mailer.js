const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

const sendAssessmentEmails = async (assessmentData) => {
    const {
        email,
        isUKRegistered,
        documentsSubmitted, // now a string ("Yes"/"No")
        knowsJobRoleAndCode,
        meetsSalaryThreshold,
        authorizingOfficerAvailable
    } = assessmentData;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "New Sponsor License Eligibility Assessment Submitted",
        text: `
A new Sponsor License Eligibility Assessment has been submitted.

Submitted by: ${email}
Is UK Registered: ${isUKRegistered}
Documents Submitted: ${documentsSubmitted === "Yes" ? "Yes (sufficient)" : "No or insufficient"}
Knows Job Role & SOC Code: ${knowsJobRoleAndCode}
Meets Salary Threshold: ${meetsSalaryThreshold}
Authorizing Officer Available: ${authorizingOfficerAvailable}

You can follow up with the user for next steps.
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Assessment email sent successfully');
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
const sendAdminApplicationDetails = async (application) => {
  const adminEmail = process.env.EMAIL;
const formatPrice = (amount) => {
  if (!amount || typeof amount !== 'number') return 'N/A';
  return `£${(amount / 100).toFixed(2)}`;
};

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "N/A";

  const formatted = `
✅ Sponsor Licence Application Paid

👤 User: ${application.user?.email || "N/A"}
🆔 Application ID: ${application._id}
📅 Submitted At: ${application.submittedAt || "Not submitted"}
💳 Stripe Session ID: ${application.stripeSessionId || "N/A"}

💼 Plan Information:
- Selected Plan: ${application.selectedPlan || "N/A"}
- Price Paid: ${formatPrice(application.planPrice)}
- Paid At: ${formatDate(application.planPaidAt)}
- Valid Until: ${formatDate(application.planValidUntil)}

🟢 Getting Started:
- Already has Sponsor Licence: ${application.gettingStarted?.hasSponsorLicense?.value ? "Yes" : "No"}
  - Licence Number: ${application.gettingStarted?.hasSponsorLicense?.licenseNumber || "N/A"}
- Had Sponsor Licence Before: ${application.gettingStarted?.hadSponsorLicenseBefore?.value ? "Yes" : "No"}
  - Licence Number: ${application.gettingStarted?.hadSponsorLicenseBefore?.licenseNumber || "N/A"}
- Licence Revoked/Suspended: ${application.gettingStarted?.hadLicenseRevokedOrSuspended ? "Yes" : "No"}
- Rejected Before: ${application.gettingStarted?.rejectedBefore?.value ? "Yes" : "No"}
  - Reason: ${application.gettingStarted?.rejectedBefore?.reason || "N/A"}
- Wants to sponsor Skilled Workers: ${application.gettingStarted?.wantsToSponsorSkilledWorkers ? "Yes" : "No"}
- Is Recruitment Agency: ${application.gettingStarted?.isRecruitmentAgency?.value ? "Yes" : "No"}
  - Contracts Out: ${application.gettingStarted?.isRecruitmentAgency?.contractsOutToOthers ? "Yes" : "No"}

🏢 About Your Company:
- Trading Name: ${application.aboutYourCompany?.tradingName || "N/A"}
- Registered Name: ${application.aboutYourCompany?.registeredName || "N/A"}
- Website: ${application.aboutYourCompany?.website || "N/A"}
- Companies House No.: ${application.aboutYourCompany?.companiesHouseNumber || "N/A"}
- Registered Address: ${application.aboutYourCompany?.registeredAddress || "N/A"}
- PAYE Ref Present: ${application.aboutYourCompany?.hasPayeReference ? "Yes" : "No"}
  - PAYE Refs: ${(application.aboutYourCompany?.payeReferences || []).join(", ") || "N/A"}
  - Exempt Reason: ${application.aboutYourCompany?.payeExemptReason || "N/A"}
- Other Work Locations: ${application.aboutYourCompany?.hasOtherLocations ? "Yes" : "No"}
  - Locations: ${(application.aboutYourCompany?.otherWorkLocations || []).join(", ") || "N/A"}
- Same as Registered Address: ${application.aboutYourCompany?.sameAsRegistered ? "Yes" : "No"}
  - Trading Address: ${application.aboutYourCompany?.tradingAddress || "N/A"}
- Description: ${application.aboutYourCompany?.description || "N/A"}
- Hours: ${application.aboutYourCompany?.operatingHours || "N/A"}
- Days: ${(application.aboutYourCompany?.operatingDays || []).join(", ")}

🏗️ Company Structure:
- Sector: ${application.companyStructure?.sector}
- Care Sector: ${application.companyStructure?.operatesInCareSector ? "Yes" : "No"}
- Domiciliary Care: ${application.companyStructure?.operatesInDomiciliaryCare ? "Yes" : "No"}
- Company Type: ${application.companyStructure?.companyType}
- Entity Type: ${application.companyStructure?.entityType}
- Trading Since: ${application.companyStructure?.tradingDuration}
- Operating Regions: ${(application.companyStructure?.operatingRegions || []).join(", ")}
- Traded Under Other Names: ${application.companyStructure?.tradedUnderOtherNames ? "Yes" : "No"}
  - Previous Names: ${(application.companyStructure?.previousTradingNames || []).map(n => `${n.name} (${formatDate(n.from)} to ${formatDate(n.to)})`).join("; ") || "N/A"}
- VAT Registered: ${application.companyStructure?.vatRegistered ? "Yes" : "No"}
  - VAT No.: ${application.companyStructure?.vatNumber || "N/A"}
- Needs Governing Body Reg.: ${application.companyStructure?.requiresGoverningBodyRegistration ? "Yes" : "No"}
  - Name: ${application.companyStructure?.governingBodyDetails?.name || "N/A"}
  - Reg. No.: ${application.companyStructure?.governingBodyDetails?.registrationNumber || "N/A"}
  - Expiry: ${formatDate(application.companyStructure?.governingBodyDetails?.expiryDate)}

👥 Authorising Officers:
${(application.authorisingOfficers || []).map((a, i) => `
${i + 1}. ${a.title || ""} ${a.firstName} ${a.lastName} (${a.email})
  DOB: ${formatDate(a.dateOfBirth)}
  Role: ${a.companyRole}
  NI Number: ${a.hasNationalInsuranceNumber ? a.nationalInsuranceNumber : `Exempt - ${a.niNumberExemptReason || "N/A"}`}
  Nationality: ${a.nationality}
  Settled Worker: ${a.isSettledWorker ? "Yes" : "No"}
  Immigration Status: ${a.immigrationStatus}
  Convictions: ${a.hasConvictions ? a.convictionDetails || "Yes" : "No"}
  Holiday Upcoming: ${a.hasUpcomingHoliday ? "Yes" : "No"}
`).join("\n") || "None"}

🟠 Level 1 Users:
${(application.level1AccessUsers || []).map((u, i) => `
${i + 1}. ${u.level1User?.firstName} ${u.level1User?.lastName} (${u.level1User?.email})
  NI Number: ${u.level1User?.hasNINumber ? u.level1User?.nationalInsuranceNumber : `Exempt - ${u.level1User?.niExemptReason || "N/A"}`}
  Nationality: ${u.level1User?.nationality}
  Settled Worker: ${u.level1User?.isSettledWorker ? "Yes" : "No"}
  Convictions: ${u.level1User?.hasConvictions ? u.level1User?.convictionDetails || "Yes" : "No"}
`).join("\n") || "None"}
🔵 Organization Size:
- Turnover: ${application.organizationSize?.turnover || "N/A"}
- Assets: ${application.organizationSize?.assets || "N/A"}
- Employees: ${application.organizationSize?.employees || "N/A"}

🔶 Activity & Needs:
- No. of UK Employees: ${application.activityAndNeeds?.numberOfEmployeesUK ?? "N/A"}
- Employs Migrant Workers: ${application.activityAndNeeds?.employsMigrantWorkers ? "Yes" : "No"}
  - Migrant Worker Count: ${application.activityAndNeeds?.migrantWorkerCount ?? "N/A"}

- Undefined CoS Required: ${application.activityAndNeeds?.undefinedCosRequired ?? "N/A"}
- Defined CoS Required: ${application.activityAndNeeds?.definedCosRequired ?? "N/A"}
- Reasons for Sponsorship: ${(application.activityAndNeeds?.reasonsForSponsorship || []).join(", ") || "N/A"}
- Justification: ${application.activityAndNeeds?.sponsorshipJustification || "N/A"}

- Identified Candidates: ${application.activityAndNeeds?.hasIdentifiedCandidates ? "Yes" : "No"}
${(application.activityAndNeeds?.prospectiveEmployees || []).map((e, i) => `
  ${i + 1}. Role: ${e.role}
     Nationality: ${e.nationality}
     Residence: ${e.currentResidence}
     Currently Employed: ${e.currentlyEmployed ? "Yes" : "No"}
     Passport: ${e.passport || "N/A"}
`).join("\n") || "None"}

- HR Platform: ${application.activityAndNeeds?.hasHRPlatform ? "Yes" : "No"}
  - Name: ${application.activityAndNeeds?.hrPlatformName || "N/A"}
  - Covers All: ${application.activityAndNeeds?.hrPlatformCoversAll ? "Yes" : "No"}
  - Wants Borderless App: ${application.activityAndNeeds?.wantsBorderlessApp ? "Yes" : "No"}
  - Compliance Plan: ${application.activityAndNeeds?.compliancePlan || "N/A"}
  
📎 Supporting Documents:
${application.supportingDocuments ? Object.entries(application.supportingDocuments.toObject()).map(([key, val]) => {
  if (Array.isArray(val)) {
    return val.map((f, i) => `- ${key}[${i + 1}]: ${f.url}`).join("\n");
  } else if (val?.url) {
    return `- ${key}: ${val.url}`;
  }
  return null;
}).filter(Boolean).join("\n") : "Not Provided"}

📃 Declaration:
- Service: ${application.declarations?.serviceType || "N/A"}
- Can Meet Duties: ${application.declarations?.canMeetSponsorDuties ? "Yes" : "No"}
- Agreed Terms: ${application.declarations?.agreesToTerms ? "Yes" : "No"}
`;

  try {
    await transporter.sendMail({
      from: adminEmail,
      to: adminEmail,
      subject: "✅ New Sponsorship Application Paid – Full Details",
      text: formatted,
    });
    console.log("📧 Admin application details sent.");
  } catch (err) {
    console.error("❌ Failed to send admin application email:", err);
  }
};


module.exports = {
    sendAssessmentEmails,
    sendAdminApplicationDetails
};


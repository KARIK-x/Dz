# Legal & Compliance Check - Release 1.0.0-rc1

**Date**: 2025-11-30  
**Release Branch**: release/verify-and-package-202511301755  
**Target**: Chrome Web Store Publication

## Document Status

### ✅ Created Documents

1. **README.md** - ✅ Present
   - Location: `/README.md`
   - Contains: Installation, features, deployment guide
   - Status: Complete

2. **.env.example** - ✅ Present
   - Location: `/.env.example`
   - Contains: All required environment variables with placeholders
   - Status: Complete

### ⚠️ Required But MISSING

3. **Privacy Policy** - ❌ MISSING (CRITICAL)
   - Required for: Chrome Web Store submission
   - Location: Should be `docs/PRIVACY_POLICY.md` (or hosted URL)
   - Status: **BLOCKER - Must create before CWS submission**
   - Content needed:
     - Data collection practices (hashed user IDs only)
     - No PII collection statement
     - Cookie usage (none)
     - Third-party services (Daraz, eSewa, Khalti)
     - Data retention (12 months for consent logs)
     - User rights (access, deletion)
     - Contact information

4. **Terms of Service** - ❌ MISSING (RECOMMENDED)
   - Required for: User agreement and liability protection
   - Location: Should be `docs/TERMS_OF_SERVICE.md`
   - Status: **HIGH PRIORITY**
   - Content needed:
     - Service description
     - User obligations
     - Cashback terms (Rs. 5 per purchase, minimum Rs. 100 payout)
     - Disclaimer of warranties
     - Limitation of liability
     - Governing law (Nepal)

5. **manifest.json Privacy Field** - ❌ NOT SET
   - Current: `privacy_policy` field missing in manifest.json
   - Required: Must link to hosted privacy policy URL
   - Status: **BLOCKER for Chrome Web Store**
   - Action: Add `"privacy_policy": "https://yourdomain.com/privacy"` to manifest

## Third-Party Approvals

### ⏸️ Pending Approvals

1. **Daraz Affiliate Program** - ⏸️ PENDING
   - Status: AFFILIATE_CODE is placeholder
   - Required: Approval from Daraz affiliate program
   - Process:
     - Apply at Daraz affiliate portal
     - Provide extension details and marketing plan
     - Receive affiliate code
     - Update .env with real code
   - **BLOCKER**: Cannot earn commission without approval

2. **eSewa Merchant Account** - ⏸️ PENDING
   - Status: ESEWA credentials are placeholders
   - Required: Merchant account with KYC
   - Process:
     - Register merchant account
     - Complete KYC documentation
     - Receive merchant ID and secret key
     - Test in sandbox environment
     - Integrate production credentials
   - **BLOCKER**: Cannot process payouts without account

3. **Khalti Merchant Account** - ⏸️ PENDING
   - Status: KHALTI credentials are placeholders
   - Required: Merchant account with KYC
   - Process:
     - Register merchant account
     - Complete KYC documentation
     - Receive public and secret keys
     - Test in sandbox environment
     - Integrate production credentials
   - **BLOCKER**: Cannot process payouts without account

## Legal Review Requirements

### 🔴 Critical (Must Complete Before Launch)

1. **Nepal Tax Compliance**
   - Issue: Commission income may be taxable
   - Required: Consult with Nepal tax advisor
   - Action: Determine PAN/VAT registration requirements
   - Status: NOT STARTED

2. **Business Registration**
   - Issue: May need registered business entity
   - Required: Company registration (if required by Nepal law)
   - Action: Consult with Nepal business lawyer
   - Status: NOT STARTED

3. **Daraz Terms of Service Review**
   - Issue: Must comply with Daraz affiliate TOS
   - Required: Legal review of Daraz affiliate agreement
   - Action: Read and ensure compliance with all terms
   - Status: NOT STARTED

4. **Data Protection Compliance**
   - Issue: GDPR-like requirements may apply
   - Required: Assess Nepal data protection laws
   - Action: Implement user data access/deletion flows if required
   - Status: PARTIAL (deletion flow not implemented)

### 🟡 Recommended

5. **Payout Agreement Template**
   - Issue: Users need to agree to payout terms
   - Recommended: User agreement for KYC data collection
   - Action: Draft payout terms and user consent flow
   - Status: NOT STARTED

6. **Fraud Policy Publication**
   - Issue: Users should know fraud detection rules
   - Recommended: Publish fraud hold policy (30 days for new users)
   - Action: Add to Terms of Service or FAQ
   - Status: MENTIONED in README only

## Chrome Web Store Requirements

### Mandatory Items

✅ Functional extension  
✅ Clear single purpose  
✅ Minimal permissions  
❌ Privacy Policy (MISSING)  
❌ Promotional images (MISSING)  
❌ Detailed description (PARTIAL - in README)  
✅ Screenshots (need to create)  

### Screenshots Required

- [ ] 1280x800 or 640x400 promotional images
- [ ] At least 1 screenshot showing extension in action
- [ ] Screenshot of cashback widget on Daraz page
- [ ] Screenshot of popup UI with balance

Status: **NOT CREATED**

## Intellectual Property

✅ No trademark violations (original branding)  
✅ No copyright violations (all code original)  
⚠️ "Daraz" trademark used descriptively (acceptable under fair use)  
✅ No patented technology used  

## Liability & Disclaimers

⚠️ Need to add disclaimers:
- "Not officially affiliated with Daraz"
- "Cashback subject to Daraz affiliate program terms"
- "No guarantee of cashback amount or approval"
- "Payouts processed manually, may take 7-14 days"

Status: PARTIAL (in README, should be in TOS)

## Summary of BLOCKERS

### Absolute Blockers (Cannot publish without)
1. ❌ Privacy Policy document
2. ❌ Privacy Policy URL in manifest.json
3. ❌ Chrome Web Store promotional images/screenshots

### High Priority (Cannot operate without)
4. ⏸️ Daraz affiliate program approval
5. ⏸️ eSewa merchant account
6. ⏸️ Khalti merchant account
7. ⏸️ Nepal tax/legal compliance review

### Recommended Before Public Launch
8. ⏸️ Terms of Service document
9. ⏸️ Business entity registration (if required)
10. ⏸️ Professional legal review

## Recommended Actions

### Immediate (Before CWS Submission)
1. Draft Privacy Policy using template (see docs/PRIVACY_POLICY_TEMPLATE.md)
2. Host Privacy Policy on public URL or include in repository
3. Update manifest.json with privacy_policy field
4. Create 4-5 screenshots of extension (1280x800)
5. Create promotional images for Chrome Web Store

### Within 1 Week (Before Launch)
1. Apply for Daraz affiliate program
2. Register eSewa merchant account
3. Register Khalti merchant account
4. Draft Terms of Service
5. Consult with Nepal lawyer on business/tax requirements

### Within 1 Month (Post-Launch)
1. Complete KYC for payment processors
2. Register business entity if required
3. Obtain tax registration (PAN/VAT) if required
4. Get professional legal review of all documents

## Contact & Support

**Email**: support@yourdomain.com (UPDATE THIS)  
**Privacy Contact**: privacy@yourdomain.com (UPDATE THIS)  
**Legal Contact**: legal@yourdomain.com (UPDATE THIS)

---

**Prepared by**: Senior Release Engineer  
**Review Status**: INCOMPLETE - Legal review required  
**Next Review**: After Privacy Policy creation

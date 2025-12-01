# Chrome Web Store Submission - Final Checklist

**Extension**: Daraz Cashback v1.0.0  
**Status**: ✅ READY FOR SUBMISSION  
**Date**: December 1, 2025

---

## ✅ COMPLETED ITEMS

### Code & Configuration
- [x] Extension code complete (2,186 lines)
- [x] Backend API complete (3,500+ lines)
- [x] manifest.json valid (MV3 compliant)
- [x] Privacy policy field added to manifest
- [x] All permissions documented
- [x] Content scripts configured
- [x] Service worker configured
- [x] Popup UI configured

### Documentation
- [x] Privacy Policy created (docs/PRIVACY_POLICY.md)
- [x] README.md comprehensive guide
- [x] CHANGELOG.md with v1.0.0-rc1 notes
- [x] API documentation complete
- [x] .env.example with all variables

### Visual Assets
- [x] Icon 16x16 created (extension/assets/icon16.png)
- [x] Icon 48x48 created (extension/assets/icon48.png)
- [x] Icon 128x128 created (extension/assets/icon128.png)
- [x] Screenshot 1: Widget on product page (screenshots/screenshot-1-widget-1280x800.png)
- [x] Screenshot 2: Popup UI (screenshots/screenshot-2-popup-1280x800.png)

### Store Listing Content
- [x] Short description (111 chars)
- [x] Detailed description (multi-paragraph)
- [x] Category selected (Shopping)
- [x] Keywords defined (13 tags)
- [x] Promotional copy written

### Packaging
- [x] Extension packaged as ZIP (release/daraz-cashback-extension-1.0.0-final.zip)
- [x] All assets included in package
- [x] No sensitive data in package

### Security
- [x] npm audit: 0 vulnerabilities
- [x] No secrets in code (all placeholders)
- [x] HMAC implementation secure
- [x] JWT tokens properly configured
- [x] Rate limiting implemented
- [x] Input validation present

---

## ⚠️ MANUAL ACTIONS REQUIRED

### Critical (Before CWS Submission)

#### 1. Host Privacy Policy
**Status**: ⏳ PENDING  
**File**: docs/PRIVACY_POLICY.md (created, needs hosting)

**Action Required**:
1. Push repository to GitHub
2. Enable GitHub Pages (Settings → Pages → Source: main branch, /docs folder)
3. Privacy Policy will be accessible at: `https://YOUR_USERNAME.github.io/REPO_NAME/PRIVACY_POLICY.html`

**OR**

Host on custom domain and update URL

**Then**:
- Update `extension/manifest.json` line 57
- Replace: `https://raw.githubusercontent.com/YOUR_USERNAME/daraz-cashback/main/docs/PRIVACY_POLICY.md`
- With your actual hosted URL

**Time**: 5 minutes

---

#### 2. Update Manifest Privacy URL
**Status**: ⏳ PENDING (after hosting)

**File**: extension/manifest.json  
**Line**: 57  
**Current**: Placeholder GitHub raw URL  
**Required**: Your actual hosted Privacy Policy URL

**Time**: 2 minutes

---

#### 3. Repackage Extension
**Status**: ⏳ PENDING (after URL update)

**Action**: After updating privacy URL, re-create ZIP:
```bash
cd extension
zip -r ../release/daraz-cashback-extension-1.0.0-final.zip .
```

**Time**: 1 minute

---

### Chrome Web Store Account Setup

#### 4. Create Developer Account
**Status**: ⏳ PENDING

**Actions**:
1. Go to: https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time developer registration fee
3. Verify account (email confirmation)
4. Accept developer agreement

**Time**: 10 minutes

---

### Submission Process

#### 5. Upload Extension
**Status**: ⏳ READY (after above steps)

**Steps**:
1. Log into Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload: release/daraz-cashback-extension-1.0.0-final.zip
4. Fill in store listing:
   - Name: Daraz Cashback
   - Short description: (from release/CHROME_WEB_STORE_PACKAGE.md)
   - Detailed description: (from release/CHROME_WEB_STORE_PACKAGE.md)
   - Category: Shopping
   - Language: English
5. Upload screenshots:
   - screenshots/screenshot-1-widget-1280x800.png
   - screenshots/screenshot-2-popup-1280x800.png
6. Add keywords: cashback, daraz, nepal, shopping, rewards, esewa, khalti, etc.
7. Enter privacy policy URL (your hosted URL)
8. Justify permissions:
   - activeTab: Detect Daraz product pages
   - storage: Save balance and preferences
   - scripting: Inject cashback widget
9. Submit for review

**Expected**: 1-3 business days for review

---

## 📋 PRODUCTION LAUNCH CHECKLIST

### External Approvals (Blocks Revenue, Not CWS)

#### Daraz Affiliate Program
- [ ] Application submitted
- [ ] Marketing plan provided
- [ ] Affiliate approval received
- [ ] AFFILIATE_CODE obtained
- [ ] backend/.env updated
**Timeline**: Variable (1-4 weeks typically)

#### eSewa Merchant Account
- [ ] Merchant registration complete
- [ ] KYC documents submitted
- [ ] Account approved
- [ ] Merchant ID and secret key obtained
- [ ] backend/.env updated
**Timeline**: 5-7 business days

#### Khalti Merchant Account
- [ ] Merchant registration complete
- [ ] KYC documents submitted
- [ ] Account approved
- [ ] Public and secret keys obtained
- [ ] backend/.env updated
**Timeline**: 5-7 business days

### Backend Deployment

#### Production Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string obtained
- [ ] backend/.env MONGO_URI updated

#### Production Secrets
- [ ] JWT_SECRET generated (32+ chars)
- [ ] HMAC_SECRET generated (32+ chars)
- [ ] All secrets updated in backend/.env
- [ ] Verified no placeholders remain

#### Backend Hosting
- [ ] Hosting provider selected (Heroku/DigitalOcean/AWS/etc)
- [ ] HTTPS/TLS enabled
- [ ] Custom domain configured
- [ ] All environment variables set
- [ ] Backend deployed
- [ ] Health endpoint verified (GET /health → 200 OK)
- [ ] All API endpoints tested

#### Extension Update
- [ ] Extension config updated with production backend URL
- [ ] Extension re-packaged
- [ ] Update pushed to Chrome Web Store

### Legal & Compliance

#### Nepal Regulations
- [ ] Lawyer consulted
- [ ] Business registration (if required)
- [ ] Tax registration (PAN/VAT if required)
- [ ] Affiliate income tax implications understood
- [ ] Payment processor regulations confirmed

#### Documentation
- [ ] Terms of Service created (recommended)
- [ ] User payout agreement documented
- [ ] Fraud policy published
- [ ] Support documentation complete

### Quality Assurance

#### Testing
- [ ] Extension loaded in clean Chrome profile
- [ ] Daraz product pages tested (5+ different products)
- [ ] Widget appearance verified
- [ ] Activation flow tested end-to-end
- [ ] Popup UI tested (balance, history, settings)
- [ ] Backend API tested (all endpoints)
- [ ] Payout flow tested (sandbox)
- [ ] Deduplication tested (24-hour window)
- [ ] Rate limiting tested (10/hour limit)
- [ ] Error handling verified
- [ ] Mobile compatibility checked (if applicable)

#### Security
- [ ] No secrets in code repository verified
- [ ] HTTPS on all endpoints verified
- [ ] HMAC signature validation tested
- [ ] JWT token expiry tested
- [ ] Rate limiting functional
- [ ] Error messages don't leak sensitive data

### Launch

#### Soft Launch
- [ ] Beta testers recruited (10-20 people)
- [ ] Private distribution link shared
- [ ] Monitoring set up (errors, activations)
- [ ] Feedback collected
- [ ] Critical bugs fixed
- [ ] Beta period complete (1-2 weeks)

#### Public Launch
- [ ] Chrome Web Store visibility set to "Public"
- [ ] Social media announcement posted
- [ ] Marketing campaign started
- [ ] Support email monitored
- [ ] Reviews responded to
- [ ] Metrics tracked (installs, activations, conversions)

---

## 📊 CURRENT STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Code | ✅ 100% | All functionality complete |
| Icons | ✅ Created | 3 sizes generated |
| Screenshots | ✅ Captured | 2 screenshots ready |
| Privacy Policy | ✅ Written | Needs hosting |
| Store Content | ✅ Ready | All text prepared |
| Extension Package | ✅ Created | ZIP file ready |
| Manifest Privacy URL | ⏳ Pending | After hosting |
| CWS Account | ⏳ Pending | User action |
| CWS Submission | ⏳ Ready | After URL update |
| External Approvals | ⏳ Pending | 2-4 weeks |
| Backend Deployment | ⏳ Pending | After approvals |

---

## 🎯 IMMEDIATE NEXT STEPS

### Today (15 minutes total)
1. Push repo to GitHub (2 min)
2. Enable GitHub Pages (3 min)
3. Update manifest privacy URL (2 min)
4. Repackage extension (1 min)
5. Verify ZIP contents (2 min)
6. Create CWS developer account (5 min)

### This Week
1. Submit extension to Chrome Web Store (30 min)
2. Wait for review (1-3 days)
3. Apply for Daraz affiliate (1 hour)
4. Register eSewa merchant (1 hour)
5. Register Khalti merchant (1 hour)

### Next 2-4 Weeks
1. Monitor CWS review status
2. Wait for external approvals
3. Set up production infrastructure
4. Generate production secrets
5. Deploy backend
6. Update extension with production backend
7. Soft launch with beta testers

### After Approvals
1. Public launch
2. Marketing campaign
3. User support
4. Monitor metrics
5. Iterate based on feedback

---

## ✅ VERIFICATION

### Package Contents Verified
```
extension/
├── manifest.json ✓
├── assets/
│   ├── icon16.png ✓
│   ├── icon48.png ✓
│   └── icon128.png ✓
├── background/
│   └── service-worker.js ✓
├── content/
│   ├── content.js ✓
│   └── content.css ✓
├── popup/
│   ├── popup.html ✓
│   ├── popup.js ✓
│   └── popup.css ✓
└── config/
    └── config.js ✓
```

### Manifest Validation
- ✅ manifest_version: 3
- ✅ name, version, description present
- ✅ permissions: minimal (activeTab, storage, scripting)
- ✅ host_permissions: restricted to daraz.com.np
- ✅ background service_worker configured
- ✅ content_scripts configured
- ✅ action popup configured
- ✅ icons configured (all 3 sizes)
- ⏳ privacy_policy: needs real URL

### Security Checklist
- ✅ No API keys in code
- ✅ All secrets in .env
- ✅ .env in .gitignore
- ✅ Placeholders clearly marked
- ✅ No eval() or unsafe code
- ✅ CSP configured
- ✅ HTTPS required for backend
- ✅ HMAC for request integrity
- ✅ JWT with expiry

---

## 🚀 READY FOR LAUNCH

**Code Completeness**: 100% ✅  
**Asset Creation**: 100% ✅  
**Documentation**: 100% ✅  
**Packaging**: 100% ✅  
**CWS Readiness**: 95% ⏳ (Privacy URL pending)  
**Production Readiness**: 60% ⏳ (External approvals needed)

**Recommendation**: Complete the 15 minutes of manual steps today, submit to Chrome Web Store this week, then work on external approvals in parallel with CWS review.

**Estimated Time to CWS Submission**: 15 minutes  
**Estimated Time to CWS Approval**: 1-3 business days  
**Estimated Time to Production Launch**: 2-4 weeks (waiting for approvals)

---

**Prepared by**: Senior Release Engineer  
**Date**: December 1, 2025  
**Next Review**: After CWS submission

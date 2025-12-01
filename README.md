# Daraz Cashback Extension

A complete cashback extension for Daraz Nepal, similar to Honey. Users earn Rs. 5 on qualifying purchases while supporting the extension through affiliate commissions.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 7.0
- Chrome Browser (for extension testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/daraz-cashback.git
   cd daraz-cashback
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp ../.env.example ../.env
   # Edit .env and replace all PLACEHOLDER values
   npm start
   ```

3. **Load Chrome Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` directory

### Using Docker (Recommended for Development)

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 📋 Features

- **🎯 Product Detection**: Automatically detects Daraz product pages
- **💰 Cashback Tracking**: Earn Rs. 5 per qualifying purchase
- **🔒 Privacy-First**: No PII collection, only hashed user IDs
- **✅ HMAC Security**: Server-side affiliate link generation with signed tokens
- **📊 Admin Dashboard**: Track activations, conversions, and payouts
- **🚫 Fraud Detection**: Multi-layered heuristics and 30-day new user hold
- **💳 Payout Support**: eSewa and Khalti integration (simulated in sandbox)

## 🏗️ Architecture

### Chrome Extension (MV3)
- **Manifest V3** with minimal permissions
- **Content Script**: Product detection, widget injection
- **Service Worker**: HMAC signing, API communication
- **Popup UI**: Balance display, activation history, payout requests

### Backend API (Node.js + Express + MongoDB)
- **Server-side affiliate link generation** (AFFILIATE_CODE never exposed)
- **JWT-signed redirect tokens** (5-minute TTL)
- **HMAC-SHA256 request verification** (5-minute expiry window)
- **Rate limiting**: 10 activations/hour per user
- **Fraud detection**: High-frequency, IP-sharing, velocity checks
- **Payment simulation**: eSewa and Khalti (90% success rate for testing)

## 📖 API Documentation

See [docs/API_DOCS.md](docs/API_DOCS.md) for complete API reference.

### Key Endpoints

#### Public Endpoints
- `POST /api/activate` - Create activation (returns signed redirect URL)
- `GET /r/:token` - Redirect to Daraz affiliate URL
- `GET /api/userBalance` - Get user balance
- `POST /api/payout` - Request payout
- `POST /api/consent` - Log consent event

#### Admin Endpoints (JWT Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Metrics and analytics
- `GET /api/admin/users` - List users (paginated)
- `POST /api/admin/pause` - Emergency system pause

## 🔐 Security

### HMAC Signing
All activation requests use HMAC-SHA256 with 5-minute expiry:
```
signature = HMAC-SHA256(hashedUserId|productId|timestamp, HMAC_SECRET)
```

### Affiliate Link Protection
- AFFILIATE_CODE stored server-side only
- Redirect tokens expire in 5 minutes
- Click events logged for reconciliation

### Rate Limiting
- 10 activations per hour per user
- 100 API requests per minute per IP
- 5 payout requests per day per user

## 📊 Database Schema

### Collections
- **Users**: Hashed IDs, balance, fraud hold status
- **Activations**: Product data, HMAC signatures, 24h deduplication
- **Purchases**: Commission tracking, admin approval
- **Payouts**: Payment processing status
- **ConsentEvents**: GDPR audit trail (12-month TTL)
- **ClickLogs**: Affiliate reconciliation (12-month TTL)
- **Admins**: JWT authentication, role-based access

## 🛠️ Development

### Run Backend Tests
```bash
cd backend
npm test                  # Unit tests
npm run test:integration  # Integration tests
npm run lint              # ESLint
npm run audit             # Security audit
```

### Chrome Extension Development
1. Make changes to files in `extension/`
2. Go to `chrome://extensions/`
3. Click "Reload" button on extension card
4. Test on Daraz.com.np product pages

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Replace all `PLACEHOLDER` values in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use strong random secrets (minimum 32 characters)
- [ ] Configure real eSewa/Khalti merchant accounts
- [ ] Set up MongoDB Atlas or production database
- [ ] Enable HTTPS/TLS for backend
- [ ] Update `BASE_URL` to production domain
- [ ] Legal review completed (see docs/LEGAL_REVIEW_CHECKLIST.md)
- [ ] Privacy Policy hosted and linked in manifest.json
- [ ] Chrome Web Store assets prepared

### Chrome Web Store Submission
1. Build production extension: `npm run build:extension`
2. Create `.zip` file of `extension/` directory
3. Prepare screenshots (1280x800 or 640x400)
4. Submit to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
5. Review feedback and address any issues

See [docs/PUBLISH_CHECKLIST.md](docs/PUBLISH_CHECKLIST.md) for detailed steps.

## ⚠️ Legal & Compliance

> **IMPORTANT**: This code is a template. Before commercial use:
> - Obtain legal review (Nepal tax laws, Daraz affiliate TOS, Chrome policies)
> - Verify Daraz affiliate program approval
> - Complete KYC with eSewa/Khalti
> - Register business entity if required in Nepal

See:
- [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md)
- [docs/TERMS_OF_SERVICE.md](docs/TERMS_OF_SERVICE.md)
- [docs/LEGAL_REVIEW_CHECKLIST.md](docs/LEGAL_REVIEW_CHECKLIST.md)

## 📁 Project Structure

```
/
├── extension/              # Chrome Extension (MV3)
│   ├── manifest.json       # Extension manifest
│   ├── content/            # Content scripts & widget
│   ├── popup/              # Popup UI
│   ├── background/         # Service worker
│   └── assets/             # Icons & images
├── backend/                # Node.js API
│   ├── server.js           # Express app
│   ├── config.js           # Configuration
│   ├── routes/             # API routes
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── middleware/         # HMAC, auth, rate limiting
│   └── utils/              # Crypto, fraud, payment
├── docs/                   # Documentation
├── tests/                  # Test suites
├── docker-compose.yml      # Docker setup
└── .env.example            # Environment template
```

## 🔧 Configuration

### Environment Variables

See [.env.example](./.env.example) for all configuration options.

**Critical Variables**:
- `HMAC_SECRET`: Used for request signing (32+ chars)
- `JWT_SECRET`: Used for admin tokens (32+ chars)
- `AFFILIATE_CODE`: Your Daraz affiliate code (from Daraz)
- `MONGO_URI`: MongoDB connection string
- `ESEWA_MERCHANT_ID` / `KHALTI_SECRET_KEY`: Payment credentials

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: See `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/yourusername/daraz-cashback/issues)
- **Email**: support@yourdomain.com

## 🗺️ Roadmap

- [ ] Firefox extension support
- [ ] Multi-store support (other Nepal e-commerce)
- [ ] Auto-apply coupon codes
- [ ] Price tracking alerts
- [ ] Referral program
- [ ] Mobile app (React Native)

## ⚡ Performance

- Backend response time: <200ms (target)
- Widget load time: <100ms
- MongoDB indexes for optimal queries
- Rate limiting to prevent abuse

## 📊 Monitoring (Production)

Recommended tools:
- **APM**: DataDog, New Relic
- **Error Tracking**: Sentry
- **Logs**: Winston + LogStash
- **Uptime**: UptimeRobot, Pingdom

---

**Made with ❤️ for Nepal's e-commerce community**

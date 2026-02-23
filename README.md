# 🛡️ Shield AI - Enterprise AI Security Gateway

**Production-ready, multi-tenant AI Security Gateway** that enables enterprises to safely use LLMs (OpenAI, Gemini, Anthropic) while automatically redacting sensitive data before it reaches external AI providers.

---

## 🎯 Core Features

### 🔒 Advanced PII/PHI Redaction
- **Automatic Detection**: Emails, phone numbers, SSN, passports, DOB, medical records
- **Financial Security**: Credit cards, CVV, IBAN, SWIFT, bank accounts, salary mentions
- **Technical Secrets**: API keys, AWS credentials, JWT tokens, SSH keys, internal IPs
- **Corporate Secrets**: Project codenames, confidential keywords, custom blacklists
- **Contextual Placeholders**: `[EMAIL_REDACTED]`, `[PHONE_HIDDEN]`, `[INTERNAL_IP]`

### 🏢 Multi-Tenant Architecture
- **Complete Isolation**: Users, API keys, token budgets, audit logs
- **Custom Branding**: Logo upload, primary color customization
- **Flexible Storage**: NONE (default), REDACTED_ONLY, FULL prompt storage modes
- **Department-Based Access**: HR, Legal, Dev, Sales prompt templates

### 🔑 BYOK (Bring Your Own Key) Vault
- **AES-256 Encryption**: Military-grade API key storage
- **Provider Support**: OpenAI, Google Gemini, Anthropic Claude
- **Key Testing**: Built-in validation with last verified timestamps
- **Zero Client Exposure**: Keys never reach browser JavaScript

### 📊 Governance Dashboard
- **Real-Time Metrics**: Token usage, estimated costs, redaction counts
- **Security Score**: Automatic calculation based on redaction ratios
- **Audit Logs**: Complete request history with user tracking
- **CSV Export**: Compliance reporting for SOC 2, HIPAA, GDPR

### 🛡️ Enterprise Security
- **Role-Based Access**: SUPER_ADMIN, ADMIN, USER roles
- **Token Budgets**: Per-user and per-tenant daily limits with 80% warnings
- **Rate Limiting**: Built-in protection against abuse
- **Authentication**: NextAuth with credential-based login (Azure AD/Okta ready)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (optional, for rate limiting)
- Docker & Docker Compose (recommended)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/metanexservices/AIGateway.git
cd AIGateway

# Configure environment
cp .env.example .env
# Edit .env with your secrets

# Start services
docker-compose up -d

# Run migrations
docker exec shieldai-app npx prisma migrate deploy

# Access at http://localhost:3000
```

#### Option 2: Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial tenant (optional)
npx prisma db seed

# Start development server
npm run dev
```

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shieldai"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="your-encryption-key-min-32-chars"

# Optional: Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### Database Migration

```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## 📦 Project Structure

```
shieldai/
├── prisma/
│   └── schema.prisma          # Database schema with multi-tenant models
├── src/
│   ├── components/
│   │   ├── Layout.tsx         # Main app shell with navigation
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── encryption.ts      # AES-256 key encryption
│   │   ├── prisma.ts          # Database client
│   │   ├── rateLimit.ts       # Rate limiting middleware
│   │   └── shield/
│   │       └── advancedRedaction.ts  # Core PII/PHI redaction engine
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # Chat API with Shield protection
│   │   │   ├── keys/          # API key management
│   │   │   ├── users/         # User management
│   │   │   ├── settings/      # Tenant configuration
│   │   │   ├── audit/         # Audit log queries
│   │   │   ├── health.ts      # Health check
│   │   │   └── version.ts     # Version info
│   │   ├── auth/
│   │   │   └── signin.tsx     # Login page
│   │   ├── dashboard.tsx      # Governance dashboard
│   │   ├── chat.tsx           # Protected chat interface
│   │   ├── keys.tsx           # BYOK vault management
│   │   ├── users.tsx          # User management (Admin)
│   │   ├── settings.tsx       # Tenant settings (Admin)
│   │   └── audit.tsx          # Audit logs viewer (Admin)
│   ├── styles/
│   │   └── globals.css        # Dark cybersecurity theme
│   └── types/
│       └── next-auth.d.ts     # NextAuth type extensions
├── Dockerfile                 # Production container
├── docker-compose.yml         # Multi-service orchestration
└── .env.example               # Environment template
```

---

## 🔐 Security Features

### Redaction Categories

| Category | Examples | Placeholder |
|----------|----------|-------------|
| **Email** | `user@domain.com` | `[EMAIL_REDACTED]` |
| **Phone** | `+1-555-0123`, `(555) 123-4567` | `[PHONE_HIDDEN]` |
| **SSN** | `123-45-6789` | `[SSN_REDACTED]` |
| **Credit Card** | `4532-1234-5678-9010` | `[CARD_REDACTED]` |
| **API Keys** | `sk-...`, `AKIA...` | `[API_KEY_HIDDEN]` |
| **IP Address** | `192.168.1.1`, `10.0.0.1` | `[INTERNAL_IP]` |
| **Salary** | `$120,000`, `€85K` | `[SALARY_REDACTED]` |
| **Custom** | Tenant blacklist | `[CORPORATE_SECRET]` |

### Prompt Storage Modes

- **NONE** (default): Only metadata (tokens, timestamp, user)
- **REDACTED_ONLY**: Store sanitized prompt after Shield processing
- **FULL**: Store raw prompt + AI response (compliance use cases)

### Token Budget Enforcement

```typescript
// Per-user daily limit
user.dailyTokenLimit = 100000

// Per-tenant daily budget
tenant.dailyTokenBudget = 1000000

// Warning at 80% usage
// Block at 100% usage
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Chat
- `POST /api/chat` - Send prompt with Shield protection
  - Validates token budgets
  - Applies redaction middleware
  - Routes to selected AI provider
  - Logs metadata

### API Keys (Admin)
- `GET /api/keys` - List all keys (masked)
- `POST /api/keys` - Add new API key (encrypted)
- `DELETE /api/keys?id={id}` - Remove key
- `POST /api/keys/test` - Validate key with provider

### Users (Admin)
- `GET /api/users` - List tenant users
- `POST /api/users` - Create new user
- `DELETE /api/users?id={id}` - Remove user

### Settings (Admin)
- `GET /api/settings` - Get tenant configuration
- `PUT /api/settings` - Update tenant settings

### Audit (Admin)
- `GET /api/audit?startDate=&endDate=&userId=&provider=` - Query logs

### System
- `GET /api/health` - Database health check
- `GET /api/version` - Build version info

---

## 🎨 White-Labeling

Admins can customize:
- **Logo Upload**: Replace Shield AI branding
- **Primary Color**: Automatic theme generation
- **Domain**: Future support for `ai.clientdomain.com`

Theme updates apply instantly via CSS variables:

```css
:root {
  --primary: /* Tenant's primary color */
  --shield-accent: /* Derived accent */
}
```

---

## 🚢 Production Deployment

### Docker Production Build

```bash
# Build optimized image
docker build -t shieldai:latest .

# Run with environment
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e ENCRYPTION_KEY="..." \
  shieldai:latest
```

### Environment Checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Secure `ENCRYPTION_KEY` (32+ chars)
- [ ] Production `DATABASE_URL` with SSL
- [ ] `NEXTAUTH_URL` matches deployment domain
- [ ] Redis configured for rate limiting
- [ ] Database backups enabled
- [ ] Log rotation configured

### Health Monitoring

```bash
# Check application health
curl http://localhost:3000/api/health

# Check version
curl http://localhost:3000/api/version
```

---

## 📈 Governance & Compliance

### Audit Log Fields
- `timestamp` - Request time
- `userId` - User who made request
- `tenantId` - Tenant isolation
- `provider` - AI provider used (OpenAI, Gemini, Anthropic)
- `tokensUsed` - Token consumption
- `redactionCount` - Number of redactions applied
- `categoriesTriggered` - Types of sensitive data found
- `estimatedCostUSD` - Calculated cost

### CSV Export
Admins can export audit logs for:
- SOC 2 compliance reporting
- HIPAA audit trails
- GDPR data processing records
- Internal security reviews

### Data Retention
Default policy:
- Metadata: Retained indefinitely
- Prompts: Based on `promptStorageMode`
- API keys: Encrypted at rest, never logged
- User sessions: 24-hour JWT tokens

---

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 15 (Pages Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: NextAuth with JWT
- **UI**: Tailwind CSS + shadcn/ui
- **Validation**: Zod schemas
- **Encryption**: AES-256-GCM

### Code Style
```bash
# Lint check
npm run lint

# Type check
npm run build

# Format code
npm run format
```

### Testing API Keys
Use the built-in key tester:
1. Navigate to `/keys`
2. Add API key
3. Click "Test Key"
4. View validation status

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/metanexservices/AIGateway/wiki)
- **Issues**: [GitHub Issues](https://github.com/metanexservices/AIGateway/issues)
- **Email**: support@metanexservices.com

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth](https://next-auth.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Shield AI** - Securing Enterprise AI at Scale 🛡️
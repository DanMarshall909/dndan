# Security Guide

## Overview

This document outlines security best practices for D&D AN development and deployment.

## Environment Variables & Secrets

### API Keys

**NEVER commit API keys to version control.** All secrets should be stored in environment variables.

#### Development Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your actual API keys in `.env`

3. Verify `.env` is in `.gitignore` (it already is)

#### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for DM and NPC agents |
| `VITE_SD_API_URL` | No | Stable Diffusion API endpoint |
| `VITE_SD_API_KEY` | No | Stable Diffusion API key |

#### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend server port |
| `NODE_ENV` | development | Node environment |
| `VITE_NPC_UPDATE_INTERVAL` | 10000 | NPC update interval (ms) |
| `VITE_NPC_MEMORY_LIMIT` | 50 | Max NPC interactions stored |
| `VITE_NPC_TEMPERATURE` | 0.9 | NPC response creativity (0-1) |

### Frontend vs Backend Variables

- **`VITE_` prefix**: Exposed to frontend (use for non-sensitive config only)
- **No prefix**: Backend only (use for API keys)

**IMPORTANT**: Never use `VITE_` prefix for sensitive secrets as they are bundled into the client-side code.

## Dependency Vulnerabilities

### Current Status

Run `npm audit` to check for vulnerabilities:

```bash
npm audit
```

### Known Issues

#### esbuild/vite Development Server (Moderate)

- **Issue**: Development server can receive requests from any website
- **Severity**: Moderate (development only)
- **Impact**: Only affects local development, not production
- **Mitigation**:
  - Only run dev server on localhost
  - Don't expose dev server to public networks
  - Use production build for deployment

To update to latest secure versions:
```bash
# This may introduce breaking changes
npm audit fix --force
```

### Keeping Dependencies Updated

Regular updates:
```bash
# Check for outdated packages
npm outdated

# Update non-breaking changes
npm update

# Update specific package
npm update vite
```

## Production Deployment

### Environment Variables

**DO NOT use .env files in production.** Instead, configure environment variables through your hosting platform:

#### Vercel
```bash
vercel env add ANTHROPIC_API_KEY
```

#### Netlify
Add in: Site Settings → Environment Variables

#### Docker
```dockerfile
ENV ANTHROPIC_API_KEY=your_key_here
```

Or use docker-compose:
```yaml
environment:
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

### API Key Rotation

Rotate API keys regularly:

1. Generate new key at https://console.anthropic.com/
2. Update environment variables in production
3. Deploy changes
4. Delete old key after verifying new one works

### CORS Configuration

The backend currently allows all origins (`cors()`). For production, restrict to your domain:

```typescript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
}));
```

### Rate Limiting

Consider adding rate limiting for production:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Security Best Practices

### Code Review Checklist

- [ ] No hardcoded API keys or secrets
- [ ] All secrets use environment variables
- [ ] `.env` is in `.gitignore`
- [ ] No console.log of sensitive data
- [ ] Input validation on all API endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] CORS is properly configured for production

### User Data

Currently, the game doesn't collect user data. If you add user accounts:

1. **Never store passwords in plain text** - use bcrypt
2. **Use HTTPS in production** - Let's Encrypt is free
3. **Implement CSRF protection** - use csurf middleware
4. **Sanitize user input** - prevent XSS attacks
5. **Follow GDPR/CCPA** - if collecting EU/CA user data

### NPC Agent Security

The LangChain NPC system makes API calls to Claude. Security considerations:

1. **API Key Protection**: Never expose `ANTHROPIC_API_KEY` to frontend
2. **Rate Limiting**: NPCs update every 10 seconds by default (configurable)
3. **Memory Limits**: Each NPC stores max 50 interactions (prevents memory exhaustion)
4. **Input Validation**: Validate all NPC dialogue input
5. **Cost Control**: Monitor API usage to prevent unexpected bills

### Monitoring

Track API usage:

```typescript
// Add request counter
let requestCount = 0;

app.post('/api/claude', async (req, res) => {
  requestCount++;
  console.log(`[Server] Total requests: ${requestCount}`);
  // ... rest of handler
});
```

For production, use proper monitoring:
- Sentry for error tracking
- LogRocket for user session replay
- DataDog or New Relic for APM

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT open a public GitHub issue**
2. Email the maintainer privately
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Anthropic Security Guidelines](https://docs.anthropic.com/claude/docs/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Compliance

If deploying commercially, consider:

- **GDPR** (EU): User data protection, right to deletion
- **CCPA** (California): Consumer privacy rights
- **COPPA** (US): Children's privacy (if under 13)
- **SOC 2**: Security audit certification

## License & Legal

This project uses:
- Anthropic Claude API (subject to Anthropic's Terms of Service)
- D&D trademarks (Wizards of the Coast) - fan project only
- LangChain (MIT License)

Ensure compliance with all applicable licenses and terms of service.

---

**Last Updated**: 2025-11-15

**Security Contact**: Create an email or security policy for your project

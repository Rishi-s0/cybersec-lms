# 🔐 Admin Account Creation Guide

## Security Policy
**Admin accounts CANNOT be created through public registration** for security reasons. Only students can register publicly.

## Methods to Create Admin Accounts

### 1. Database Seeding (Development)
```bash
npm run seed
```
Creates default admin: `admin@hackademy.com` / `password123`

### 2. Command Line Script
```bash
node backend/scripts/dbOperations.js create-admin <username> <email> <password>
```

**Example:**
```bash
node backend/scripts/dbOperations.js create-admin johnadmin admin@company.com securepass123
```

### 3. Via Existing Admin (Admin Panel)
1. Login as existing admin
2. Go to Admin Dashboard → User Management
3. Create new user and set role to "admin"

### 4. Direct Database Update (Emergency)
```javascript
// MongoDB command
db.users.updateOne(
  { email: 'user@example.com' }, 
  { $set: { role: 'admin' } }
)
```

## Why This Security Measure?

- **Prevents unauthorized admin access**
- **Stops privilege escalation attacks**
- **Ensures admin accounts are intentionally created**
- **Follows security best practices**

## Default Admin Account
- **Email**: `admin@hackademy.com`
- **Password**: `password123`
- **Created via**: Database seeding

**⚠️ Change default password in production!**
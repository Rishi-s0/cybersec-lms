# 🔧 MongoDB Connection Issue - Solutions

## ⚠️ Current Issue
The MongoDB Atlas connection is failing due to SSL/TLS errors. This is a common issue with MongoDB Atlas and can be resolved in several ways.

## 🔄 Solution Options

### Option 1: Fix MongoDB Atlas Connection (Recommended)

1. **Check IP Whitelist**
   - Go to your MongoDB Atlas dashboard
   - Navigate to Network Access
   - Add your current IP address or use `0.0.0.0/0` for testing (allows all IPs)

2. **Update Connection String**
   - Make sure your `.env` file has the correct connection string
   - Try adding `&tlsAllowInvalidCertificates=true` to the connection string (for development only)

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybersec-lms?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true
   ```

### Option 2: Use Local MongoDB (Quick Fix)

1. **Install MongoDB Locally**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 mongo`

2. **Update `.env` file**
   ```
   MONGODB_URI=mongodb://localhost:27017/cybersec-lms
   ```

3. **Seed the Database**
   ```bash
   node backend/seeds/sampleData.js
   ```

### Option 3: Update Node.js OpenSSL Settings

Add this to your `.env` file:
```
NODE_OPTIONS=--openssl-legacy-provider
```

Or run with:
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

## 🚀 After Fixing

1. Stop the current process (Ctrl+C)
2. Restart the project:
   ```bash
   npm run dev
   ```

3. The application should now connect successfully!

## 📝 Current Status

- ✅ Frontend: Running on http://localhost:3000
- ❌ Backend: Waiting for MongoDB connection
- ⏳ MongoDB: Connection issues (SSL/TLS error)

## 🆘 Need Help?

If none of these solutions work, you can:
1. Check MongoDB Atlas status page
2. Verify your network/firewall settings
3. Try a different network (sometimes corporate networks block MongoDB Atlas)
4. Use a VPN if your IP is blocked

---
**Once MongoDB is connected, all features will work perfectly!** 🎯

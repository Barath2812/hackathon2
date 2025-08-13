# 🚀 Quick MongoDB Atlas Setup for Learning Platform

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Shared" cluster (free tier)

## Step 2: Create Database
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to you
5. Click "Create"

## Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Username: `learning-platform-user`
4. Password: `your-secure-password`
5. Role: "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Update Environment Variables
Create a `.env` file in your project root:

```env
MONGODB_URI=mongodb+srv://learning-platform-user:your-password@cluster0.xxxxx.mongodb.net/learning-platform?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Step 7: Test Connection
Run this command to test:
```bash
node test-roadmap-creation.js
```

## Step 8: Seed Database (Optional)
```bash
node scripts/seed-dummy-data.js
```

## Step 9: Start Application
```bash
npm start
```

## Step 10: Test Roadmap Creation
1. Open http://localhost:3000
2. Login with dummy credentials
3. Go to Learning Plans
4. Click "Choose Roadmap"
5. Select a roadmap and create!

## 🎯 Benefits of MongoDB Atlas:
- ✅ No local installation required
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Scalable
- ✅ Works on any device
- ✅ No configuration needed

## 🔧 Alternative: Local MongoDB
If you prefer local MongoDB:
1. Download MongoDB Community Server
2. Install and start the service
3. Use connection string: `mongodb://localhost:27017/learning-platform`

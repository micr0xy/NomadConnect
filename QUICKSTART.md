# Quick Start Guide - NomadConnect Authentication

## 🚀 Fastest Way to Get Running

### Step 1: Backend Configuration (2 minutes)

1. **Update `.env` file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/nomad_connect?retryWrites=true&w=majority
JWT_SECRET=s3cr3tK3yF0rN0madC0nn3ct
JWT_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

2. **Start backend:**
```bash
cd NOMAD\ CONNECT
npm install  # Only first time
npm run dev
```

Expected output:
```
✓ MongoDB Connected: cluster0.xxxxx.mongodb.net
✓ Server running on port 5000
```

### Step 2: Frontend Configuration (2 minutes)

1. **Update `App.jsx` line 21:**
```jsx
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
```

2. **Start frontend:**
```bash
cd frontend
npm install  # Only first time
npm run dev
```

Expected output:
```
VITE v7.2.4  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Test the Flow (1 minute)

1. Open browser: http://localhost:5173
2. Click "Sign Up"
3. Fill form and submit → Redirects to dashboard
4. Click profile menu → Shows user info
5. Click "Logout" → Returns to home

**That's it! You have working authentication!**

---

## 🔐 Google OAuth Setup (10 minutes)

### Get Google Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Search for "Google+ API" → Enable it
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173`
   - `http://localhost:5000`
7. Add authorized redirect URIs:
   - `http://localhost:5173`
8. Copy Client ID and Secret to `.env`

**Done!** Google OAuth button now works.

---

## 📚 File Changes Summary

### Backend Files Created/Modified:
- ✅ `src/models/User.js` - Added googleId, authProvider fields
- ✅ `src/controllers/auth.controller.js` - Added googleAuth function
- ✅ `src/routes/auth.routes.js` - Added POST /api/auth/google
- ✅ `src/db.js` - Updated to MongoDB connection
- ✅ `src/server.js` - Added cookie-parser middleware
- ✅ `.env` - Updated with Google OAuth credentials

### Frontend Files Created/Modified:
- ✅ `src/store/authStore.js` - Zustand store (NEW)
- ✅ `src/services/api.js` - Axios instance (NEW)
- ✅ `src/pages/LoginPage.jsx` - Added Google OAuth button
- ✅ `src/pages/SignupPage.jsx` - Added Google OAuth button
- ✅ `src/pages/DashboardPage.jsx` - User dashboard (NEW)
- ✅ `src/components/Navbar.jsx` - Auth-aware navigation
- ✅ `src/components/ProtectedRoute.jsx` - Protected routes (NEW)
- ✅ `src/App.jsx` - Added GoogleOAuthProvider, routes, auth check
- ✅ `frontend/package.json` - Added zustand, axios, @react-oauth/google, jwt-decode

---

## 🧪 Quick API Test

### Test with cURL:

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"TestPass123","confirmPassword":"TestPass123"}' \
  -c cookies.txt
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  -c cookies.txt
```

**Check Auth (with cookie):**
```bash
curl http://localhost:5000/api/auth/checkauth \
  -b cookies.txt
```

---

## 🎯 What You Can Do Now

✅ Users can **sign up** with email/password  
✅ Users can **log in** with email/password  
✅ Users can **log in with Google** (1-click)  
✅ **Protected dashboard** showing user profile  
✅ **Session persistence** (survives page refresh)  
✅ **Logout** clears authentication  
✅ **Responsive UI** on all devices  
✅ **Security headers** (httpOnly cookies, JWT)  

---

## ⚠️ Important Notes

1. **MongoDB Atlas URL** - Replace with your actual cluster
2. **Google Client ID** - Get from Google Cloud Console
3. **JWT Secret** - Use a strong random string in production
4. **Frontend URL** - Both servers communicate via `http://localhost`

---

## 📞 Need Help?

Check `FULLSTACK_AUTH_GUIDE.md` for:
- Detailed architecture explanation
- All API endpoint specifications
- Auth flow diagrams
- Troubleshooting guide
- Future enhancement ideas

---

## 🎉 You're All Set!

Visit http://localhost:5173 and start building on top of this authentication system!

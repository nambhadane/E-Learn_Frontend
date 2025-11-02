# Frontend Port Update Summary

## ✅ Changes Made

I've updated your frontend to point to port **8082** (your backend port) instead of 8081.

### Files Updated:
1. ✅ `src/lib/api/config.ts` - Main API configuration
2. ✅ `src/pages/teacher/Profile.tsx` - Profile image loading
3. ✅ `src/pages/teacher/Notes.tsx` - Lesson view URL
4. ✅ `src/lib/api/notesApi.ts` - Notes API view endpoint

All now default to `http://localhost:8082` if no environment variable is set.

---

## 🔧 Next Steps

### 1. Fix the Eureka Connection Issue

Your backend is trying to connect to Eureka but it's not running. You have two options:

#### Option A: Disable Eureka (Quick Fix for Development)
Add to your backend `application.properties` or `application.yml`:
```properties
eureka.client.enabled=false
```

#### Option B: Start Eureka Server
Start Eureka server on port 8761 before starting your backend.

See `FIX_EUREKA_OR_DISABLE.md` for detailed instructions.

---

### 2. Restart Your Backend

After disabling Eureka or starting the Eureka server:
- Stop your backend service
- Start it again
- Check logs - should see no more "Connection refused" errors

---

### 3. Test Login

1. Restart your frontend (if it's running):
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Try logging in with your credentials
3. Should work now! 🎉

---

## 📝 Environment Variable (Optional)

If you want to override the port via environment variable, create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:8082
```

This is optional since 8082 is now the default.

---

## ✅ Verification

After fixing Eureka and restarting:

1. **Backend logs should show:**
   - ✅ No "Connection refused" errors
   - ✅ Service started successfully
   - ✅ If Eureka enabled: "DiscoveryClient - registration complete"

2. **Frontend login should:**
   - ✅ Connect to `http://localhost:8082/auth/login`
   - ✅ Accept your credentials
   - ✅ Return authentication token

---

## 🐛 Still Having Issues?

If login still doesn't work after these changes:

1. Check browser console for errors
2. Check backend logs for authentication errors
3. Verify backend is running on port 8082:
   ```bash
   curl http://localhost:8082/actuator/health
   # or
   curl http://localhost:8082/auth/login
   ```
4. Make sure CORS is configured in backend to allow `http://localhost:8080` (your frontend)

---

## Summary

- ✅ Frontend updated to use port 8082
- ⚠️ Need to fix Eureka connection (disable or start server)
- ✅ Then restart backend and test login


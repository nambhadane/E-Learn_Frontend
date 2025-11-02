# Eureka Server Startup Guide - Fix Login Issues

## Problem
When you try to login, you get errors like:
- `Connection refused: getsockopt` 
- `Cannot execute request on any known server`
- `DiscoveryClient_TEACHER-SERVICE - was unable to send heartbeat`

These errors indicate that **Eureka Server is not running**. The backend services need Eureka to register themselves and communicate with each other.

## Solution: Start Services in Correct Order

### Step 1: Start Eureka Server (Port 8761)
The Eureka server must be started FIRST before any other services.

**In your backend project directory:**
```bash
# Navigate to your Eureka server project
cd <path-to-eureka-server>

# Start the Eureka server
mvn spring-boot:run
# OR if using Gradle:
./gradlew bootRun
```

**Verify Eureka is running:**
- Open browser: `http://localhost:8761`
- You should see the Eureka dashboard

### Step 2: Start API Gateway (Port 8081)
The API Gateway routes requests from the frontend to backend services.

```bash
# Navigate to your API Gateway project
cd <path-to-api-gateway>

# Start the API Gateway
mvn spring-boot:run
# OR
./gradlew bootRun
```

**Verify API Gateway is running:**
- Check logs for successful startup
- Verify it registered with Eureka (check Eureka dashboard at http://localhost:8761)

### Step 3: Start Teacher Service (Port 8082)
This service handles authentication and teacher operations.

```bash
# Navigate to your teacher-service project
cd <path-to-teacher-service>

# Start the teacher service
mvn spring-boot:run
# OR
./gradlew bootRun
```

**Verify Teacher Service is running:**
- Check logs - should show successful registration with Eureka
- Check Eureka dashboard - TEACHER-SERVICE should appear
- No more "Connection refused" errors

### Step 4: Start Other Services (if needed)
Start any other microservices your application needs (student-service, course-service, etc.)

## Verification Checklist

✅ **Eureka Server (8761):**
- [ ] Accessible at `http://localhost:8761`
- [ ] Dashboard shows "Instances currently registered with Eureka"

✅ **API Gateway (8081):**
- [ ] Running on port 8081
- [ ] Registered with Eureka
- [ ] Logs show no connection errors

✅ **Teacher Service (8082):**
- [ ] Running on port 8082
- [ ] Registered with Eureka (visible in dashboard)
- [ ] Logs show: "DiscoveryClient_TEACHER-SERVICE - registration complete"
- [ ] No "Connection refused" errors

✅ **Frontend Login:**
- [ ] Frontend can reach `http://localhost:8081/auth/login`
- [ ] Login request succeeds with correct credentials

## Common Issues & Solutions

### Issue 1: Eureka Server Won't Start
**Solution:** Check if port 8761 is already in use:
```bash
# Windows
netstat -ano | findstr :8761
# Linux/Mac
lsof -i :8761
```

### Issue 2: Services Still Can't Connect to Eureka
**Solution:** Check Eureka server configuration:
- Eureka server URL should be: `http://localhost:8761/eureka/`
- Check `application.yml` or `application.properties` in each service

### Issue 3: Login Works but Other Features Don't
**Solution:** Make sure all required services are running and registered with Eureka

## Quick Test Commands

### Test Eureka Server:
```bash
curl http://localhost:8761
```

### Test API Gateway:
```bash
curl http://localhost:8081
```

### Test Login Endpoint (before frontend):
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yourusername","password":"yourpassword"}'
```

## Architecture Overview

```
Frontend (React)
    ↓
API Gateway (Port 8081)
    ↓
    ├─→ Teacher Service (Port 8082) [via Eureka]
    ├─→ Student Service (if exists)
    └─→ Other Services...
    
All services register with:
    Eureka Server (Port 8761)
```

## Important Notes

1. **Always start Eureka Server FIRST** - Other services depend on it
2. **Wait for services to fully start** - Give each service 30-60 seconds to register
3. **Check Eureka Dashboard** - It shows which services are registered
4. **Check service logs** - They will show connection status

## Need Help?

If issues persist after following these steps:
1. Check backend project structure - ensure Eureka server exists
2. Verify Eureka server configuration files
3. Check firewall settings - ports 8761, 8081, 8082 should be accessible
4. Review backend logs for specific error messages


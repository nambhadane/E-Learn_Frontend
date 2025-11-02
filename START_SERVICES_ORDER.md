# Quick Start Order for Backend Services

## ⚠️ IMPORTANT: Start Services in This Exact Order

### 1️⃣ Eureka Server (Port 8761) - MUST START FIRST
```bash
# Start Eureka Server
cd <your-eureka-server-directory>
mvn spring-boot:run
```
**Wait until you see:** "Started EurekaServerApplication" in logs
**Verify:** Open http://localhost:8761 in browser - should see Eureka dashboard

---

### 2️⃣ API Gateway (Port 8081) - Start Second
```bash
# Start API Gateway
cd <your-api-gateway-directory>
mvn spring-boot:run
```
**Wait until you see:** Service registered with Eureka successfully
**Check Eureka Dashboard:** API Gateway should appear in registered services

---

### 3️⃣ Teacher Service (Port 8082) - Start Third
```bash
# Start Teacher Service
cd <your-teacher-service-directory>
mvn spring-boot:run
```
**Wait until you see:** "DiscoveryClient_TEACHER-SERVICE - registration complete"
**Check Eureka Dashboard:** TEACHER-SERVICE should appear

---

### 4️⃣ Test Login
Once all services are running:
1. Go to your frontend login page
2. Enter your credentials
3. Login should work now!

---

## 🚨 Current Error Explained

The errors you're seeing mean:
- ❌ Eureka Server is NOT running on port 8761
- ❌ Teacher Service (port 8082) can't register itself
- ❌ API Gateway (port 8081) might not be able to route requests
- ❌ Result: Login fails even with correct credentials

## ✅ After Starting Services Correctly

You should see in Teacher Service logs:
```
INFO: DiscoveryClient_TEACHER-SERVICE - registration complete
```

Instead of:
```
ERROR: Connection refused: getsockopt
WARN: Cannot execute request on any known server
```

---

## 📝 Quick Verification

Run these commands to verify services are up:

```bash
# Check Eureka
curl http://localhost:8761

# Check API Gateway  
curl http://localhost:8081

# Test Login
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```


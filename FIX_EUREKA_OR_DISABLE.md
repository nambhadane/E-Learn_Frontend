# Fix Eureka Connection Issues

## Current Situation
- ✅ Backend is running on port **8082**
- ✅ Frontend updated to call port **8082**
- ❌ Backend trying to connect to Eureka (port 8761) but Eureka is not running

## Solution: Two Options

### Option 1: Disable Eureka (Recommended for Development)

If you're running a standalone backend without microservices, you can disable Eureka client.

**Update your backend `application.properties` or `application.yml`:**

```properties
# Disable Eureka client
eureka.client.enabled=false
```

**OR in `application.yml`:**

```yaml
eureka:
  client:
    enabled: false
```

**After updating:**
1. Restart your backend service
2. Eureka connection errors should disappear
3. Backend will work standalone

---

### Option 2: Start Eureka Server (For Microservices Setup)

If you want to use service discovery with multiple microservices:

**1. Start Eureka Server first (port 8761):**
```bash
cd <your-eureka-server-project>
mvn spring-boot:run
```

**2. Verify Eureka is running:**
- Open: `http://localhost:8761`
- Should see Eureka dashboard

**3. Restart your backend (port 8082)**
- It should now successfully register with Eureka
- Logs should show: "DiscoveryClient_TEACHER-SERVICE - registration complete"

---

## Quick Test After Fix

Once you've either disabled Eureka or started it, test login:

```bash
curl -X POST http://localhost:8082/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yourusername","password":"yourpassword"}'
```

---

## Which Option to Choose?

- **Choose Option 1 (Disable Eureka)** if:
  - You're running a single backend service
  - You don't need service discovery
  - You want simpler setup for development
  
- **Choose Option 2 (Start Eureka)** if:
  - You have multiple microservices
  - You need service discovery
  - You're building a microservices architecture

---

## Backend Configuration Location

Eureka settings are typically in:
- `src/main/resources/application.properties`
- `src/main/resources/application.yml`

Look for these properties:
```properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

To disable, add:
```properties
eureka.client.enabled=false
```


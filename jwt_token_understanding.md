# JWT Authentication & Security Guide - EduSphere LMS

## 📋 Table of Contents
1. [What is JWT?](#what-is-jwt)
2. [JWT Structure](#jwt-structure)
3. [How JWT Works in EduSphere](#how-jwt-works-in-edusphere)
4. [Complete Flow Example: Student Arjun Sharma](#complete-flow-example)
5. [Security Best Practices](#security-best-practices)
6. [Token Lifecycle](#token-lifecycle)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

---

## What is JWT?

**JWT (JSON Web Token)** is a stateless, self-contained authentication mechanism that allows secure communication between frontend and backend without storing session data on the server.

### Why JWT?
✅ **Stateless:** No session storage needed on server  
✅ **Scalable:** Works across multiple servers/microservices  
✅ **Secure:** Cryptographically signed, tamper-proof  
✅ **Fast:** No database lookup for every request  
✅ **Mobile-friendly:** Works perfectly for mobile/SPA applications  

---

## JWT Structure

A JWT consists of **3 parts separated by dots (.)**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcmp1bi5zaGFybWFAZWR1c3BoZXJlLmRldiIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzE4NzkyMTMwLCJleHAiOjE3MTg4Nzg1MzB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[Header].[Payload].[Signature]
```

### Part 1: Header (Base64 Encoded)
```json
{
  "alg": "HS256",    // Algorithm: HMAC with SHA-256
  "typ": "JWT"       // Type: JSON Web Token
}

// Base64 Encoded:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

**Explanation:**
- `alg`: Algorithm used for signing (HS256 = HMAC-SHA256)
- `typ`: Identifies this as a JWT token

---

### Part 2: Payload (Base64 Encoded)
```json
{
  "sub": "arjun.sharma@edusphere.dev",  // Subject: Who token is for
  "role": "STUDENT",                     // Custom claim: User role
  "iat": 1718792130,                     // Issued At: Creation timestamp
  "exp": 1718878530                      // Expiration: Expiry timestamp
}

// Base64 Encoded:
// eyJzdWIiOiJhcmp1bi5zaGFybWFAZWR1c3BoZXJlLmRldiIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzE4NzkyMTMwLCJleHAiOjE3MTg4Nzg1MzB9
```

**Timestamps Converted:**
- `iat`: 1718792130 = April 19, 2026 at 09:15:30 UTC
- `exp`: 1718878530 = April 20, 2026 at 09:15:30 UTC (24 hours later)

**Explanation:**
- `sub`: Email of the authenticated user
- `role`: User's role (STUDENT, INSTRUCTOR, ADMIN)
- `iat`: When the token was created
- `exp`: When the token expires (cannot be used after this time)

---

### Part 3: Signature (HMAC-SHA256)
```
Signature = HMAC-SHA256(
    header + "." + payload,
    "your-super-secret-key-at-least-32-chars-long"
)

Result: SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Explanation:**
- The signature is created by hashing the header + payload with a secret key
- Only the backend knows the secret key
- If anyone modifies the payload, the signature won't match
- This prevents tampering

---

## How JWT Works in EduSphere

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Axios)                                    │
│ ├─ Stores token in localStorage                             │
│ ├─ Sends token in Authorization header                      │
│ └─ Handles 401 errors (expired/invalid tokens)              │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP Requests
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Spring Boot)                                       │
│ ├─ JwtAuthenticationFilter (validates token)                │
│ ├─ JwtProvider (creates/validates JWT)                      │
│ ├─ SecurityConfig (configures filter chain)                 │
│ ├─ Controllers (protected with @PreAuthorize)               │
│ └─ Services (executes business logic)                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **JwtProvider.java** (Token Creation & Validation)
Located at: `src/main/java/com/edusphere/lms/security/JwtProvider.java`

```java
@Component
public class JwtProvider {
    private final Key signingKey;
    private final long expiryMs;
    
    // Creates JWT token
    public String generateToken(String email, Role role) {
        Instant now = Instant.now();
        Instant expiryTime = now.plusMillis(expiryMs);
        
        return Jwts.builder()
            .subject(email)                    // Who token is for
            .claim("role", role.name())        // User's role
            .issuedAt(Date.from(now))          // When created
            .expiration(Date.from(expiryTime)) // When expires
            .signWith(signingKey)              // Sign with secret
            .compact();                        // Convert to string
    }
    
    // Validates JWT token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey)
                .build()
                .parseSignedClaims(token);
            return true;  // ✅ Valid
        } catch (ExpiredJwtException ex) {
            log.warn("Token expired");
            return false; // ❌ Expired
        } catch (SignatureException ex) {
            log.warn("Invalid signature");
            return false; // ❌ Tampered
        } catch (Exception ex) {
            return false; // ❌ Invalid
        }
    }
}
```

#### 2. **JwtAuthenticationFilter.java** (Request Interceptor)
Located at: `src/main/java/com/edusphere/lms/security/JwtAuthenticationFilter.java`

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Step 1: Extract Authorization header
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Step 2: Extract token
        String token = authHeader.substring(7);
        
        // Step 3: Extract email from token
        String email = jwtProvider.extractUsername(token);
        
        // Step 4: Validate token & set authentication
        if (email != null && 
            SecurityContextHolder.getContext().getAuthentication() == null &&
            jwtProvider.validateToken(token)) {
            
            // Load user from database
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
            
            // Set in Spring Security context
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

#### 3. **SecurityConfig.java** (Filter Chain Configuration)
Located at: `src/main/java/com/edusphere/lms/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
            throws Exception {
        http
            // Disable CSRF (stateless API doesn't need it)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Stateless sessions (no session cookies)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Public endpoints
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            
            // Add JWT filter
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## Complete Flow Example

### Scenario: Student Arjun Sharma Logs In and Views Marks

#### **Step 1: Registration (Optional - First Time)**

**Frontend Request:**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Arjun Sharma",
  "email": "arjun.sharma@edusphere.dev",
  "password": "SecurePass123",
  "role": "STUDENT",
  "collegeId": "EES2024001"
}
```

**Backend Processing:**
```java
// AuthService.register()
1. Normalize email: arjun.sharma@edusphere.dev
2. Check if email exists: NO
3. Create User entity
4. Save to database
5. Return user profile (NO token yet)
```

**Frontend Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "9f7c-4a2b-9e1d-...",
    "name": "Arjun Sharma",
    "email": "arjun.sharma@edusphere.dev",
    "role": "STUDENT"
  }
}
```

---

#### **Step 2: Login (JWT Created Here!)**

**Frontend Request:**
```javascript
// LoginPage.jsx
const loginResponse = await authApi.login({
  email: "arjun.sharma@edusphere.dev",
  password: "SecurePass123"
})

// Store token
localStorage.setItem('edusphere_access_token', loginResponse.token)
authStore.setState({ 
  token: loginResponse.token,
  user: loginResponse.user,
  isAuthenticated: true
})
```

**HTTP Request:**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "arjun.sharma@edusphere.dev",
  "password": "SecurePass123"
}
```

**Backend Processing:**
```java
// AuthService.login()
1. Find user by email ✅
2. Verify password ✅
3. Check account status (ACTIVE) ✅
4. JwtProvider.generateToken(email, STUDENT) 🔑
   └─ Creates JWT with:
      - sub: "arjun.sharma@edusphere.dev"
      - role: "STUDENT"
      - iat: 1718792130 (now)
      - exp: 1718878530 (now + 24h)
      - Signature: HMAC-SHA256
5. Return token in response
```

**Backend Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "userId": "9f7c-4a2b-9e1d-...",
      "name": "Arjun Sharma",
      "email": "arjun.sharma@edusphere.dev",
      "role": "STUDENT"
    }
  }
}
```

**Frontend Storage:**
```
localStorage: {
  "edusphere_access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Zustand Store: {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { userId, name, email, role },
  isAuthenticated: true
}
```

---

#### **Step 3: View Marks (Using Token)**

**Frontend Code:**
```javascript
// studentApi.js
export async function fetchStudentMarks(params = {}) {
  const response = await axiosInstance.get('/students/me/marks', { params })
  return response.data.data
}

// Component
const marks = await fetchStudentMarks({ page: 0, size: 10 })
```

**Axios Interceptor (Automatic):**
```javascript
// axiosInstance.js
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusphere_access_token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})
```

**HTTP Request (With Token):**
```
GET /api/v1/students/me/marks?page=0&size=10
Host: localhost:8081
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Backend - Filter Chain:**
```java
// JwtAuthenticationFilter.doFilterInternal()
1. Extract Authorization header: "Bearer eyJhb..."
2. Extract token (remove "Bearer "): "eyJhb..."
3. Validate token:
   └─ Check signature: ✅ Matches (not tampered)
   └─ Check expiry: ✅ Not expired
4. Extract email from token: "arjun.sharma@edusphere.dev"
5. Load user from database
6. Create UsernamePasswordAuthenticationToken
7. Set in SecurityContextHolder
8. Request proceeds with authentication ✅
```

**Backend - Controller:**
```java
@GetMapping("/marks")
@PreAuthorize("hasRole('STUDENT')")  // ✅ Arjun is STUDENT
public ResponseEntity<ApiResponse<PagedResponse<StudentMarksResponse>>> getMarks(
    Authentication authentication,  // ✅ Set by filter
    @RequestParam int page,
    @RequestParam int size
) {
    // authentication.getName() = "arjun.sharma@edusphere.dev"
    
    PagedResponse<StudentMarksResponse> response = 
        studentService.getMarks(authentication.getName(), null, page, size, ...);
    
    return ResponseEntity.ok(
        ApiResponse.success("Marks fetched", response)
    );
}
```

**Backend - Service:**
```java
public PagedResponse<StudentMarksResponse> getMarks(
    String email, String courseId, int page, int size, String sortBy, String sortDir) {
    
    // Verify ownership: Only Arjun can see Arjun's marks
    User student = userRepository.findByEmail(email);
    if (student == null) throw new UnauthorizedException();
    
    // Query marks for this student
    Page<Marks> marksPage = marksRepository.findByStudentId(
        student.getUserId(),
        buildPageable(page, size, sortBy, sortDir)
    );
    
    // Transform to DTO
    List<StudentMarksResponse> content = marksPage.getContent()
        .stream()
        .map(mark -> new StudentMarksResponse(
            mark.getMarkId(),
            mark.getCourseId(),
            mark.getAssignmentTitle(),  // component
            mark.getScore(),             // marksAwarded
            mark.getMaxScore(),          // maxMarks
            mark.getPercentage(),
            mark.getGradedBy()
        ))
        .toList();
    
    return new PagedResponse<>(content, page, size, ...);
}
```

**Frontend Response:**
```json
{
  "success": true,
  "message": "Marks fetched",
  "data": {
    "content": [
      {
        "marksId": "mark-1",
        "courseId": "course-1",
        "component": "Math Quiz 1",
        "marksAwarded": 45,
        "maxMarks": 50,
        "percentage": 90.0
      },
      {
        "marksId": "mark-2",
        "courseId": "course-2",
        "component": "Physics Assignment",
        "marksAwarded": 38,
        "maxMarks": 40,
        "percentage": 95.0
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2,
    "totalPages": 1,
    "isFirst": true,
    "isLast": true
  }
}
```

**Frontend Update:**
```javascript
// StudentMarksPage.jsx
const marksPage = await fetchStudentMarks({ page: 0, size: 10 })
setMarks(marksPage.content)  // Update state
// React re-renders with marks data ✅
```

---

## Security Best Practices

### ✅ **What We Do Right**

#### 1. **Signature Verification**
- ✅ Every token is signed with HMAC-SHA256
- ✅ Server verifies signature on every request
- ✅ Modified payloads are rejected automatically

```java
// Signature prevents tampering
Attacker modifies: "role": "STUDENT" → "role": "INSTRUCTOR"
↓
Signature no longer matches
↓
ValidationError: 401 Unauthorized
```

#### 2. **Token Expiration**
- ✅ Tokens expire after 24 hours
- ✅ Expired tokens are automatically rejected
- ✅ User must re-login to get new token

```java
@Value("${app.jwt.expiry-ms}")
private long expiryMs;  // 86400000 (24 hours)

.expiration(Date.from(now.plusMillis(expiryMs)))
```

#### 3. **Role-Based Access Control**
- ✅ Role is embedded in token
- ✅ Methods protected with `@PreAuthorize("hasRole('STUDENT')")`
- ✅ Prevents privilege escalation

```java
@PreAuthorize("hasRole('STUDENT')")  // Only STUDENT role
public ResponseEntity<...> getMarks(...) { ... }

// If Arjun tries to access @PreAuthorize("hasRole('INSTRUCTOR')")
// ❌ Access Denied: 403 Forbidden
```

#### 4. **Stateless Design**
- ✅ No session data stored on server
- ✅ Server doesn't need to remember Arjun
- ✅ Scales across multiple servers

#### 5. **HTTP-Only Storage (Best Practice)**
- ⚠️ Currently stored in localStorage (accessible to JavaScript)
- ✅ Recommendation: Use HTTP-Only cookies (not accessible to XSS)

---

### ⚠️ **Security Considerations & Recommendations**

#### 1. **Plain-Text Passwords (Current Issue)**
```java
// ❌ CURRENT: NoOpPasswordEncoder
@Bean
public PasswordEncoder passwordEncoder() {
    return NoOpPasswordEncoder.getInstance();
}

// ✅ RECOMMENDED: BCrypt
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Usage:
// Registration: user.setPassword(passwordEncoder.encode(password))
// Login: passwordEncoder.matches(inputPassword, user.getPassword())
```

#### 2. **Token Storage (Current vs Recommended)**

**Current (localStorage):**
```javascript
// ❌ Vulnerable to XSS attacks
localStorage.setItem('edusphere_access_token', token)
// If attacker injects JavaScript, they can steal it:
// const stolen = localStorage.getItem('edusphere_access_token')
```

**Recommended (HTTP-Only Cookie):**
```javascript
// ✅ Secure against XSS (JavaScript cannot access)
// Backend sets:
response.addCookie(new Cookie("accessToken", token));
// Cookie.setHttpOnly(true);
// Cookie.setSecure(true);  // HTTPS only
// Cookie.setSameSite("Strict");  // CSRF protection
```

#### 3. **Refresh Token Implementation**

**Why:**
- Access tokens are short-lived (15 minutes)
- Refresh tokens are long-lived (30 days)
- Better security if access token is stolen

```java
// Future Implementation
@PostMapping("/auth/refresh")
public ResponseEntity<ApiResponse<LoginResponse>> refresh(
    @CookieValue String refreshToken) {
    
    if (!jwtProvider.validateToken(refreshToken)) {
        throw new UnauthorizedException("Refresh token expired");
    }
    
    String email = jwtProvider.extractUsername(refreshToken);
    String newAccessToken = jwtProvider.generateToken(email, role);
    
    return ResponseEntity.ok(
        ApiResponse.success("Token refreshed", 
            new LoginResponse(newAccessToken, "Bearer", ...))
    );
}
```

#### 4. **HTTPS Requirement**
```
⚠️ CRITICAL: Never transmit tokens over HTTP
✅ ALWAYS use HTTPS in production
```

#### 5. **Secret Key Management**
```yaml
# ❌ WRONG: Hard-coded secret
private static final String SECRET = "my-secret-key";

# ✅ RIGHT: Environment variable
app:
  jwt:
    secret: ${JWT_SECRET}
    expiry-ms: ${JWT_EXPIRY_MS}
```

```bash
# Set in production:
export JWT_SECRET="very-long-random-secret-at-least-32-chars-minimum"
```

#### 6. **CORS Configuration**
```java
// ❌ WRONG
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOriginPatterns(List.of("*"));  // Accept all origins

// ✅ RIGHT
config.setAllowedOriginPatterns(List.of(
    "https://edusphere.com",
    "https://app.edusphere.com"
));
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
config.setAllowCredentials(true);
```

#### 7. **Token Revocation (Logout)**
```java
// Future Implementation: Redis blacklist
@PostMapping("/auth/logout")
public ResponseEntity<ApiResponse<Void>> logout(
    @RequestHeader("Authorization") String authHeader) {
    
    String token = authHeader.substring(7);
    long expiryMs = jwtProvider.getExpiryMs();
    
    // Add token to Redis blacklist
    redisTemplate.opsForValue().set(
        "token-blacklist:" + token,
        "revoked",
        Duration.ofMillis(expiryMs)
    );
    
    return ResponseEntity.ok(
        ApiResponse.success("Logged out successfully", null)
    );
}
```

---

## Token Lifecycle

```
Time              Event                       Token Status    Storage
────────────────────────────────────────────────────────────────────────────
Day 1
09:15:30          Registration                NO TOKEN        —

09:16:00          Login                        ✅ CREATED      localStorage
                  Token expiry set to
                  Day 2, 09:15:30

09:16:30          View Marks (Request 1)      ✅ VALID        Used
                  Token sent in request       (expires in
                  Validated on backend        ~24h)

15:30:00          Attendance Check            ✅ VALID        Used
                  (5h 14m elapsed)            (expires in
                                              ~19h)

Day 2
08:15:00          Assignment Submission       ✅ VALID        Used
                  (~23h elapsed)              (expires in
                                              ~1h)

09:15:31          New Request                 ❌ EXPIRED      Still in
                  Token validation fails                       localStorage
                  401 Unauthorized
                  Frontend catches error

09:15:32          Frontend clears token       DELETED         localStorage
                  Redirects to login                          cleared

09:15:45          Login again                 ✅ NEW TOKEN    localStorage
                  New token generated         created
```

---

## Error Handling

### 401 Unauthorized Errors

```javascript
// axiosInstance.js
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    
    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('edusphere_access_token')
      
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)
```

### Common 401 Scenarios

| Scenario | Status | Cause | Solution |
|----------|--------|-------|----------|
| No token sent | 401 | Missing Authorization header | Login again |
| Expired token | 401 | `exp` timestamp passed | Login again |
| Invalid signature | 401 | Token was tampered | Login again |
| Wrong role | 403 | User doesn't have required role | Use correct account |
| Invalid format | 401 | Token format incorrect | Clear localStorage, login |

---

## Troubleshooting

### Issue 1: "401 Unauthorized" on Every Request

**Cause:** Token not being sent

**Solution:**
```javascript
// Check localStorage
console.log(localStorage.getItem('edusphere_access_token'))

// Verify Axios interceptor is set
console.log(axiosInstance.defaults.headers)

// Check Authorization header
// Network tab → Request Headers → Authorization: Bearer ...
```

### Issue 2: "Token Expired" After Login

**Cause:** Token expiry too short

**Solution:**
```yaml
# application.yml
app:
  jwt:
    expiry-ms: 86400000  # 24 hours (in milliseconds)
    # 1 hour = 3600000
    # 24 hours = 86400000
    # 7 days = 604800000
```

### Issue 3: Frontend Can Access Token Via Console

**Cause:** Stored in localStorage (JavaScript-accessible)

**Solution:**
```javascript
// Better: Use HTTP-Only cookies (cannot access via JavaScript)
// Backend sends token as HTTP-Only cookie
// Frontend automatically sends cookie with requests
// Attacker cannot steal with XSS
```

### Issue 4: Same Token Works on Different Devices Simultaneously

**Cause:** JWT is stateless (no revocation tracking)

**Solution:**
```java
// Implement Redis blacklist on logout
// Or use refresh token pattern with DB validation
```

---

## Configuration

### Backend Configuration (application.yml)

```yaml
app:
  jwt:
    # Secret key for signing tokens
    secret: "${JWT_SECRET:default-secret-change-in-production}"
    
    # Token expiry in milliseconds
    # 24 hours = 86400000
    expiry-ms: 86400000
    
  cors:
    allowed-origins: ["http://localhost:5173", "http://localhost:3000"]

spring:
  security:
    user:
      name: admin
      password: admin

server:
  port: 8081
  servlet:
    context-path: /api/v1
```

### Frontend Configuration (axios)

```javascript
// axiosInstance.js
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusphere_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## Security Checklist

- [ ] JWT signature is verified on every request
- [ ] Tokens have expiration time (24 hours)
- [ ] Expired tokens are rejected with 401
- [ ] Role-based access control is enforced
- [ ] HTTPS is used in production (not HTTP)
- [ ] Secret key is in environment variables
- [ ] CORS is configured for allowed origins only
- [ ] Passwords are hashed with BCrypt (not plain-text)
- [ ] HTTP-Only cookies are used (or consider moving from localStorage)
- [ ] Token refresh mechanism is implemented
- [ ] Logout invalidates tokens (Redis blacklist)
- [ ] No sensitive data in token payload
- [ ] Request validation is enforced
- [ ] Rate limiting is configured

---

## FAQ

**Q: Is JWT encrypted?**  
A: No, JWT is Base64 encoded (not encrypted). Anyone can read the payload. Never put passwords or credit cards in JWT. Use HTTPS to prevent interception.

**Q: Can I change the token after login?**  
A: No, tokens are immutable. If you need to change role/permissions, user must logout and login again.

**Q: What if someone steals my token?**  
A: With the stolen token, they can access your account for 24 hours. After 24 hours, token expires. Use short token expiry (15 min) and refresh tokens for better security.

**Q: Can I use same token on multiple devices?**  
A: Yes, JWT is stateless. Same token works everywhere. If you want to limit to one device, use session IDs or add device tracking.

**Q: What's the difference between JWT and session cookies?**  
A: JWT is stateless (server doesn't store). Sessions require server storage but are more secure. Choose based on your scalability needs.

---

## References

- [JWT.io - Official JWT Documentation](https://jwt.io)
- [OWASP - JSON Web Token (JWT) Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JJWT GitHub Repository](https://github.com/jwtk/jjwt)

---

**Document Version:** 1.0  
**Last Updated:** April 19, 2026  
**EduSphere LMS Project**

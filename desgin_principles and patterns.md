# Design Patterns & Principles Identification Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Design Patterns](#design-patterns)
   - [Creational Patterns](#creational-patterns)
   - [Structural Patterns](#structural-patterns)
   - [Behavioral Patterns](#behavioral-patterns)
3. [SOLID Principles](#solid-principles)
4. [GRASP Principles](#grasp-principles)
5. [Decision Tree](#decision-tree)
6. [Quick Checklist](#quick-checklist)
7. [Summary](#summary)

---

## Introduction

This guide provides a comprehensive approach to identifying design patterns and principles in code. Design patterns are reusable solutions to common programming problems, categorized into three main types:

- **Creational Patterns**: Focus on how objects are created
- **Structural Patterns**: Focus on how objects are composed and organized
- **Behavioral Patterns**: Focus on how objects communicate and interact

Additionally, SOLID principles guide code quality, while GRASP principles help assign object responsibilities.

---

## Design Patterns

### Creational Patterns

Creational patterns solve problems related to object creation.

#### 1. SINGLETON Pattern

**How to Identify:**
- Look for private constructor
- Look for static instance variable
- Look for static getInstance() method
- In Spring: @Component, @Service, @Bean annotations

**Code Example:**

```java
// Traditional Singleton
public class JwtProvider {
    private static JwtProvider instance;
    
    private JwtProvider() { }
    
    public static JwtProvider getInstance() {
        if (instance == null) {
            instance = new JwtProvider();
        }
        return instance;
    }
}

// Spring Version
@Component
public class JwtProvider {
    // Spring creates ONE instance automatically
}
```

**When to Use:**
- Logger (single instance logs everything)
- Database connection pool
- Configuration manager
- JWT Provider (single signing key)

**Questions to Ask:**
- Should there be ONLY ONE instance of this class?
- Does it have shared state or resources?
- If YES → Use Singleton Pattern

---

#### 2. FACTORY Pattern

**How to Identify:**
- Look for static "create" or "build" methods
- Object creation hidden behind a method
- Different object types returned based on input parameters

**Code Example:**

```java
// Factory
public class ResponseFactory {
    public static <T> ApiResponse<T> createSuccess(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }
    
    public static <T> ApiResponse<Void> createError(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}

// Factory with Type Switching
public class NotificationFactory {
    public static Notification create(String type) {
        switch(type) {
            case "EMAIL": return new EmailNotification();
            case "SMS": return new SmsNotification();
            case "PUSH": return new PushNotification();
            default: throw new IllegalArgumentException("Unknown type");
        }
    }
}
```

**When to Use:**
- Creating different implementations based on type
- Hiding object construction complexity
- Creating multiple related objects

---

#### 3. BUILDER Pattern

**How to Identify:**
- Fluent interface with method chaining
- Pattern: .method1().method2().method3().build()
- Complex objects with many optional properties

**Code Example:**

```java
// Builder Pattern
User user = new User.Builder()
    .setName("John")
    .setEmail("john@example.com")
    .setRole(Role.STUDENT)
    .setStatus(UserStatus.ACTIVE)
    .build();

// JWT Builder Example (Spring JWT)
String token = Jwts.builder()
    .subject(email)
    .claim("role", role.name())
    .issuedAt(Date.from(now))
    .expiration(Date.from(now.plusMillis(expiryMs)))
    .signWith(signingKey)
    .compact();
```

**When to Use:**
- Complex objects with many properties
- Objects with optional fields
- Immutable objects

---

#### 4. PROTOTYPE Pattern

**How to Identify:**
- Clone or copy methods
- Implements Cloneable interface
- Objects created by copying existing objects

**Code Example:**

```java
@Entity
public class User implements Cloneable {
    public User clone() throws CloneNotSupportedException {
        return (User) super.clone();
    }
}

// Usage
User originalUser = userRepository.findById("123");
User copiedUser = originalUser.clone();
```

**When to Use:**
- Expensive object creation
- Template-based object creation

---

### Structural Patterns

Structural patterns solve problems related to object composition and organization.

#### 1. FACADE Pattern

**How to Identify:**
- Service class with many dependencies
- Service hides multiple repositories
- Single simple method does complex work
- Methods at higher level of abstraction

**Code Example:**

```java
@Service
public class AuthService {
    // Many dependencies (subsystem)
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    // SIMPLE public method (facade)
    public LoginResponse login(LoginRequest request) {
        // Hides all complexity
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        
        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is not active");
        }
        
        String token = jwtProvider.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, "Bearer", jwtProvider.getExpiryMs(), toUserProfile(user));
    }
}

// Client uses simple facade
@RestController
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
```

**When to Use:**
- Simplify complex subsystems
- Provide clean interface to complex library
- Coordinate multiple classes

**Questions to Ask:**
- Is this service coordinating many repositories?
- Does one method hide lots of internal steps?
- If YES → Use Facade Pattern

---

#### 2. ADAPTER Pattern

**How to Identify:**
- Converting interface A to interface B
- Implements different interface than dependency
- Wrapping one class to match another interface

**Code Example:**

```java
// Existing interface (can't change)
public interface PaymentGateway {
    void pay(double amount);
}

// Legacy class (different interface)
public class OldPaymentSystem {
    public void makePayment(int amountInCents) { }
}

// Adapter: Make OldPaymentSystem work with PaymentGateway
public class PaymentAdapter implements PaymentGateway {
    private OldPaymentSystem oldSystem;
    
    @Override
    public void pay(double amount) {
        int amountInCents = (int) (amount * 100);
        oldSystem.makePayment(amountInCents);
    }
}
```

---

#### 3. DECORATOR Pattern

**How to Identify:**
- Wrapping an object to add behavior
- Same interface as wrapped object
- "has-a" relationship plus inheritance from same interface

**Code Example:**

```java
// Base interface
public interface DataSource {
    String getData();
}

// Concrete implementation
public class FileDataSource implements DataSource {
    @Override
    public String getData() {
        return readFromFile();
    }
}

// Decorator: Adds encryption
public class EncryptedDataSource implements DataSource {
    private DataSource wrappedSource;
    
    public EncryptedDataSource(DataSource source) {
        this.wrappedSource = source;
    }
    
    @Override
    public String getData() {
        String data = wrappedSource.getData();
        return encrypt(data);
    }
}
```

**When to Use:**
- Adding functionality to objects dynamically
- Alternative to subclassing
- Spring @Transactional, @Cacheable

---

#### 4. PROXY Pattern

**How to Identify:**
- Class that controls access to another class
- Same interface as the real object
- Lazy loading, logging, permission checking

**Code Example:**

```java
// Real Subject
public interface UserService {
    UserProfileResponse getUser(String id);
}

public class RealUserService implements UserService {
    @Override
    public UserProfileResponse getUser(String id) {
        return userRepository.findById(id);
    }
}

// Proxy: Controls access
public class UserServiceProxy implements UserService {
    private RealUserService realService;
    
    @Override
    public UserProfileResponse getUser(String id) {
        log.info("Getting user: " + id);
        
        if (!hasPermission(id)) {
            throw new UnauthorizedException();
        }
        
        return realService.getUser(id);
    }
}
```

**When to Use:**
- Lazy initialization
- Access control
- Logging/auditing
- Spring @PreAuthorize, @Transactional proxies

---

#### 5. BRIDGE Pattern

**How to Identify:**
- Abstraction separated from implementation
- Multiple inheritance hierarchies
- Composition instead of inheritance

**Code Example:**

```java
// Abstraction
public abstract class Notification {
    protected NotificationService service;
    
    public Notification(NotificationService service) {
        this.service = service;
    }
    
    public abstract void send(String message);
}

// Concrete Abstraction
public class UrgentNotification extends Notification {
    @Override
    public void send(String message) {
        service.send("[URGENT] " + message);
    }
}

// Implementation interface
public interface NotificationService {
    void send(String message);
}

// Concrete Implementations
public class EmailService implements NotificationService {
    @Override
    public void send(String message) {
        // Send via email
    }
}

public class SmsService implements NotificationService {
    @Override
    public void send(String message) {
        // Send via SMS
    }
}
```

---

### Behavioral Patterns

Behavioral patterns solve problems related to object interaction and communication.

#### 1. CHAIN OF RESPONSIBILITY Pattern

**How to Identify:**
- Request passed through chain of handlers
- Each handler decides: "handle or pass to next"
- FilterChain, Filter interface
- Handler has reference to next handler

**Code Example:**

```java
// Handler interface
public interface RequestHandler {
    void handle(Request request, RequestHandler next);
}

// Concrete Handlers
public class AuthenticationHandler implements RequestHandler {
    @Override
    public void handle(Request request, RequestHandler next) {
        if (isAuthenticated(request)) {
            next.handle(request, next);
        } else {
            throw new UnauthorizedException();
        }
    }
}

public class AuthorizationHandler implements RequestHandler {
    @Override
    public void handle(Request request, RequestHandler next) {
        if (hasPermission(request)) {
            next.handle(request, next);
        } else {
            throw new ForbiddenException();
        }
    }
}

// Spring Security Implementation
http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
// Request flow: CORS Filter -> JWT Filter -> Auth Filter -> Controller
```

**When to Use:**
- Request processing pipeline
- Middleware/filter chains
- Validation chains

**Questions to Ask:**
- Does request pass through multiple handlers?
- Does each handler decide to pass or stop?
- If YES → Chain of Responsibility Pattern

---

#### 2. OBSERVER Pattern

**How to Identify:**
- addListener(), addObserver(), subscribe() methods
- Event handling
- One object notifies many objects
- @EventListener annotations (Spring)

**Code Example:**

```java
// Observer interface
public interface EventListener {
    void onAssignmentSubmitted(SubmissionEvent event);
}

// Concrete Observer
public class GradingNotificationListener implements EventListener {
    @Override
    public void onAssignmentSubmitted(SubmissionEvent event) {
        notifyInstructor(event.getAssignment(), event.getStudent());
    }
}

// Subject: publishes events
@Service
public class SubmissionService {
    private List<EventListener> listeners = new ArrayList<>();
    
    public void addListener(EventListener listener) {
        listeners.add(listener);
    }
    
    public void submitAssignment(Submission submission) {
        // Save submission
        
        // Notify all observers
        for (EventListener listener : listeners) {
            listener.onAssignmentSubmitted(new SubmissionEvent(submission));
        }
    }
}

// Spring Version
@Service
public class SubmissionService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void submitAssignment(Submission submission) {
        // Save submission
        eventPublisher.publishEvent(new SubmissionEvent(submission));
    }
}

@Component
public class GradingListener {
    @EventListener
    public void onSubmissionEvent(SubmissionEvent event) {
        // Handle event
    }
}
```

**When to Use:**
- Event handling
- Loose coupling between components
- Publish-subscribe patterns

---

#### 3. STRATEGY Pattern

**How to Identify:**
- Family of algorithms encapsulated
- Strategy interface with multiple implementations
- Context class that uses strategy
- Runtime algorithm switching

**Code Example:**

```java
// Strategy interface
public interface PaymentStrategy {
    void pay(double amount);
}

// Concrete Strategies
public class CreditCardPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // Pay via credit card
    }
}

public class UpiPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // Pay via UPI
    }
}

// Context: Uses strategy
public class PaymentProcessor {
    private PaymentStrategy strategy;
    
    public PaymentProcessor(PaymentStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void processPayment(double amount) {
        strategy.pay(amount);
    }
}

// Usage
PaymentStrategy strategy = new CreditCardPayment();
PaymentProcessor processor = new PaymentProcessor(strategy);
processor.processPayment(100);

// Switch strategy at runtime
strategy = new UpiPayment();
processor = new PaymentProcessor(strategy);
processor.processPayment(50);
```

**When to Use:**
- Multiple algorithms for same task
- Runtime algorithm selection
- Sorting strategies

---

#### 4. STATE Pattern

**How to Identify:**
- State interface with implementations
- Context that changes state
- Behavior changes based on state
- setState() methods

**Code Example:**

```java
// State interface
public interface SubmissionState {
    void submit(Submission submission);
    void grade(Submission submission, int marks);
    void reject(Submission submission);
}

// Concrete States
public class PendingState implements SubmissionState {
    @Override
    public void submit(Submission submission) {
        throw new IllegalStateException("Already submitted");
    }

    @Override
    public void grade(Submission submission, int marks) {
        throw new IllegalStateException("Cannot grade pending submission");
    }
}

public class SubmittedState implements SubmissionState {
    @Override
    public void submit(Submission submission) {
        throw new IllegalStateException("Already submitted");
    }

    @Override
    public void grade(Submission submission, int marks) {
        submission.setMarks(marks);
        submission.setState(new GradedState());
    }
}

// Context
public class Submission {
    private SubmissionState state = new PendingState();
    
    public void grade(int marks) {
        state.grade(this, marks);
    }
}
```

**When to Use:**
- Objects with complex state-dependent behavior
- State machines (orders, submissions, workflows)
- Workflow engines

---

#### 5. ITERATOR Pattern

**How to Identify:**
- Pageable, Page<T> in Spring Data
- hasNext(), next() methods
- For-each loops over custom collection
- Traversing without exposing structure

**Code Example:**

```java
// Iterator interface
public interface Iterator<T> {
    boolean hasNext();
    T next();
}

// Collection interface
public interface Collection<T> {
    Iterator<T> iterator();
}

// Concrete Collection
public class StudentList implements Collection<Student> {
    private List<Student> students = new ArrayList<>();
    
    @Override
    public Iterator<Student> iterator() {
        return students.iterator();
    }
}

// Spring Data: Page is like iterator
Page<Course> coursesPage = courseRepository.findAll(pageable);
for (Course course : coursesPage) {
    System.out.println(course.getName());
}

// Pagination example
Pageable pageable = PageRequest.of(0, 10);
Page<Course> page1 = courseRepository.findAll(pageable);
for (Course course : page1) {
    // Iterate through first page
}
```

**When to Use:**
- Traversing collections
- Pagination
- Hiding collection implementation

**Questions to Ask:**
- Do I iterate through collection without knowing structure?
- Am I using Pageable or Page?
- If YES → Iterator Pattern

---

#### 6. COMMAND Pattern

**How to Identify:**
- Request encapsulated as object
- execute(), undo(), redo() methods
- Command queue
- Undo/Redo functionality

**Code Example:**

```java
// Command interface
public interface Command {
    void execute();
    void undo();
}

// Concrete Commands
public class CreateAssignmentCommand implements Command {
    private InstructorService service;
    private CreateAssignmentRequest request;
    
    @Override
    public void execute() {
        service.createAssignment(request);
    }
    
    @Override
    public void undo() {
        // Delete assignment
    }
}

// Invoker: Executes commands
public class CommandExecutor {
    private Queue<Command> commandQueue = new LinkedList<>();
    
    public void executeCommand(Command command) {
        command.execute();
        commandQueue.add(command);
    }
    
    public void undoLastCommand() {
        if (!commandQueue.isEmpty()) {
            commandQueue.remove().undo();
        }
    }
}
```

---

#### 7. TEMPLATE METHOD Pattern

**How to Identify:**
- Abstract class with final method
- Final method calls abstract methods
- Subclasses override specific steps
- Skeleton of algorithm in base class

**Code Example:**

```java
// Template Method
public abstract class ReportGenerator {
    
    // Template Method: Final (can't override)
    public final void generateReport() {
        fetchData();
        processData();
        formatReport();
        sendReport();
    }
    
    protected abstract void fetchData();
    protected abstract void processData();
    protected abstract void formatReport();
    
    protected void sendReport() {
        // Common implementation
    }
}

// Concrete
public class PdfReportGenerator extends ReportGenerator {
    @Override
    protected void fetchData() { }
    
    @Override
    protected void processData() { }
    
    @Override
    protected void formatReport() { }
}

// Spring example
@Service
public abstract class BaseService {
    public final void save(Entity entity) {
        validate(entity);
        enrichData(entity);
        repository.save(entity);
        publishEvent(entity);
    }
    
    protected abstract void validate(Entity entity);
    protected abstract void enrichData(Entity entity);
    protected void publishEvent(Entity entity) { }
}
```

---

## SOLID Principles

SOLID principles guide high-quality code design.

### Identification Method

```
S - Single Responsibility
   Each class should have ONE reason to change
   Red Flag: "and" in class description indicates multiple responsibilities
   Example: "UserService" (good) vs "UserAndEmailService" (bad)

O - Open/Closed
   Open for extension, closed for modification
   Red Flag: Modifying existing code to add new feature
   Example: Adding new exception handler without modifying existing ones

L - Liskov Substitution
   Child class can replace parent without breaking
   Red Flag: instanceof checks violate this principle
   Example: CustomUserDetailsService implements UserDetailsService correctly

I - Interface Segregation
   Clients shouldn't depend on unused methods
   Red Flag: Interface with 20 methods - too many responsibilities
   Example: LoginRequest has only email + password (focused, not bloated)

D - Dependency Inversion
   Depend on abstractions, not concrete classes
   Red Flag: new SomeConcreteClass() indicates tight coupling
   Example: Constructor injection of UserRepository (interface)
```

### Checking SOLID Principles

| Principle | Check This | Good | Bad |
|-----------|-----------|------|-----|
| S | Class description contains "and"? | "AuthService" | "AuthAndLogService" |
| O | Add feature without modifying existing? | Add @ExceptionHandler | Modify existing handler |
| L | Child class matches parent contract? | Implements all methods | Throws UnsupportedOperation |
| I | Does client use ALL methods? | Focused DTOs | Giant BaseService |
| D | Injected or instantiated? | Constructor injection | new ConcreteClass() |

---

## GRASP Principles

GRASP (General Responsibility Assignment Software Patterns) principles guide responsibility assignment.

### 1. CREATOR

Assign creation responsibility to the class that has necessary data.

**Questions to Ask:**
- Who has the information needed to create this object?
- Who knows all the creation requirements?

**Code Example:**

```java
// WRONG: AuthController creates User
@RestController
public class AuthController {
    @PostMapping("/register")
    public void register(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.email());
    }
}

// RIGHT: AuthService creates (has validation data)
@Service
public class AuthService {
    public RegisterResponse register(RegisterRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        return new RegisterResponse(toUserProfile(user));
    }
}

// RIGHT: JwtProvider creates tokens (has secret key)
@Component
public class JwtProvider {
    private final Key signingKey;
    
    public String generateToken(String email, Role role) {
        return Jwts.builder()
            .subject(email)
            .claim("role", role.name())
            .signWith(signingKey)
            .compact();
    }
}
```

---

### 2. INFORMATION EXPERT

Assign responsibility to object that has the information needed.

**Questions to Ask:**
- Who has all the data needed?
- Who is the expert in this domain?

**Code Example:**

```java
// WRONG: Controller verifies password
@RestController
public class AuthController {
    @PostMapping("/login")
    public void login(LoginRequest request) {
        User user = getUser(request.getEmail());
        if (!request.getPassword().equals(user.getPassword())) {
            // error
        }
    }
}

// RIGHT: AuthService is expert (has both request and user data)
@Service
public class AuthService {
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email());
        
        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedException();
        }
    }
}

// RIGHT: StudentService is expert (has all student repos)
@Service
public class StudentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    
    public PagedResponse<StudentCourseResponse> getEnrolledCourses(String email, ...) {
        Page<Enrollment> enrollments = enrollmentRepository.findByUserEmail(email, pageable);
        // ...
    }
}
```

---

### 3. CONTROLLER

Object that receives system operations.

**Questions to Ask:**
- What receives the request?
- What is the use case?

**Code Example:**

```java
// RIGHT: Controller receives HTTP requests
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(...) {
        // Handles system operation: user registration
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(...) {
        // Handles system operation: user login
    }
}

// RIGHT: Facade Controller
@RestController
@RequestMapping("/api/v1/students/me")
public class StudentController {
    
    @GetMapping("/courses")
    public ResponseEntity<...> getEnrolledCourses(...) { }
    
    @GetMapping("/assignments")
    public ResponseEntity<...> getAssignments(...) { }
}
```

---

### 4. INDIRECTION

Avoid direct dependency by creating intermediary object.

**Code Example:**

```java
// WRONG: Direct dependency (tight coupling)
@RestController
public class AuthController {
    private final UserRepository userRepository;
    
    @PostMapping("/login")
    public void login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email());
    }
}

// RIGHT: Intermediary (Service) provides indirection
@RestController
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public void login(LoginRequest request) {
        authService.login(request);
    }
}

@Service
public class AuthService {
    private final UserRepository userRepository;
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email());
    }
}
```

**Questions to Ask:**
- Can I avoid direct dependency?
- Is there an intermediary?

---

### 5. POLYMORPHISM

Handle variation through abstract types and overriding.

**Code Example:**

```java
// WRONG: If-else for different types
@Service
public class NotificationService {
    public void notify(String type, String message) {
        if (type.equals("EMAIL")) {
            sendEmail(message);
        } else if (type.equals("SMS")) {
            sendSms(message);
        } else if (type.equals("PUSH")) {
            sendPush(message);
        }
    }
}

// RIGHT: Polymorphism
public interface NotificationChannel {
    void send(String message);
}

public class EmailChannel implements NotificationChannel {
    @Override
    public void send(String message) { }
}

public class SmsChannel implements NotificationChannel {
    @Override
    public void send(String message) { }
}

@Service
public class NotificationService {
    private NotificationChannel channel;
    
    public void notify(String message) {
        channel.send(message);
    }
}
```

**Questions to Ask:**
- Are there if-else statements checking type?
- Can this be abstracted?

---

### 6. PURE FABRICATION

Create synthetic object for clean design when no good object exists.

**Code Example:**

```java
// Problem: Where to put validation logic?

// RIGHT: Create Pure Fabrication
@Component
public class EmailValidator {
    
    public void validate(String email) {
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
    }
}

@Component
public class PasswordValidator {
    
    public void validate(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password too short");
        }
    }
}

// Benefits:
// - Single Responsibility: validators only validate
// - Reusable: any service can use validators
// - Testable: easy to test in isolation
```

**Questions to Ask:**
- Does responsibility fit naturally in any object?
- Should I create a helper class?

---

### 7. PROTECTED VARIATIONS

Encapsulate what varies to isolate from variations.

**Code Example:**

```java
// WRONG: Database details exposed everywhere
@RestController
public class StudentController {
    private final StudentRepository studentRepository;
    
    @GetMapping("/{id}")
    public void getStudent(@PathVariable String id) {
        Student student = studentRepository.findById(id);
    }
}

// RIGHT: Service encapsulates database access
@RestController
public class StudentController {
    private final StudentService studentService;
    
    @GetMapping("/{id}")
    public void getStudent(@PathVariable String id) {
        StudentResponse response = studentService.getStudent(id);
    }
}

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    
    public StudentResponse getStudent(String id) {
        Student student = studentRepository.findById(id);
        return toResponse(student);
    }
}

// If database changes from MySQL to MongoDB:
// - Only StudentService needs update
// - StudentController doesn't change
```

**Questions to Ask:**
- What might change?
- Is it encapsulated?

---

## Decision Tree

### How to Identify Which Pattern/Principle Applies

```
START: Found an architectural issue?

CREATION PROBLEM?
├─ Only ONE instance needed? → SINGLETON
├─ Create different objects by type? → FACTORY
├─ Complex object with many options? → BUILDER
└─ Copy existing object? → PROTOTYPE

COMPOSITION/STRUCTURE PROBLEM?
├─ Hide complex subsystem? → FACADE
├─ Add behavior to objects? → DECORATOR
├─ Control access to object? → PROXY
├─ Convert interface? → ADAPTER
└─ Separate abstraction from implementation? → BRIDGE

COMMUNICATION/BEHAVIOR PROBLEM?
├─ Request through chain? → CHAIN OF RESPONSIBILITY
├─ Many objects listen to one? → OBSERVER
├─ Different algorithms? → STRATEGY
├─ Object changes behavior by state? → STATE
├─ Traverse collection? → ITERATOR
├─ Encapsulate request? → COMMAND
└─ Algorithm skeleton in base? → TEMPLATE METHOD

CODE QUALITY PROBLEM?
├─ Class has too many reasons to change? → Single Responsibility (S)
├─ Can't add feature without modifying? → Open/Closed (O)
├─ Child breaks parent contract? → Liskov Substitution (L)
├─ Interface has unused methods? → Interface Segregation (I)
└─ Direct instantiation of concrete class? → Dependency Inversion (D)

RESPONSIBILITY PROBLEM?
├─ Who should CREATE this? → CREATOR
├─ Who has all the INFO? → INFORMATION EXPERT
├─ Who handles this operation? → CONTROLLER
├─ How to avoid direct dependency? → INDIRECTION
├─ How to handle variations? → POLYMORPHISM
├─ Where else to put this? → PURE FABRICATION
└─ How to isolate variations? → PROTECTED VARIATIONS
```

---

## Quick Checklist

### Creational Patterns

- Is there only one instance of this class? → Singleton
- Are objects created by static method? → Factory
- Is object built with method chaining? → Builder
- Can object be cloned/copied? → Prototype

### Structural Patterns

- Does service hide multiple repositories? → Facade
- Does it add behavior to existing object? → Decorator
- Does it control access to another? → Proxy
- Does it convert one interface to another? → Adapter
- Is abstraction separate from implementation? → Bridge

### Behavioral Patterns

- Does request pass through multiple handlers? → Chain of Responsibility
- Do many objects listen to events? → Observer
- Are different algorithms available? → Strategy
- Does behavior change based on state? → State
- Are you traversing a collection? → Iterator
- Is there undo/redo functionality? → Command
- Is there algorithm skeleton in base class? → Template Method

### SOLID Violations

- Does class description need "and"? → Violates S
- Must you modify code to extend? → Violates O
- Do instanceof checks exist? → Violates L
- Does interface have unused methods? → Violates I
- Is there `new ConcreteClass()`? → Violates D

### GRASP Check

- Is object created where data exists? → Creator
- Does handler have needed info? → Information Expert
- Does system entry point handle request? → Controller
- Is there intermediary object? → Indirection
- Are different types handled polymorphically? → Polymorphism
- Is there artificial class for clean design? → Pure Fabrication
- Are variations encapsulated? → Protected Variations

---

## Summary

### Pattern Summary Table

| Category | Type | Identifies By | Example |
|----------|------|---|---|
| Creational | Singleton | @Component, @Service | JwtProvider, AuthService |
| Creational | Factory | Static create methods | ApiResponse.success() |
| Structural | Facade | Service with many repos | AuthService, StudentService |
| Structural | Adapter | Implements different interface | UserDetailsService |
| Behavioral | Chain of Responsibility | Filter chain | SecurityFilterChain |
| Behavioral | Iterator | Pageable, Page<T> | StudentService.getEnrolledCourses() |

### Principle Summary Table

| Category | Type | Purpose |
|----------|------|---------|
| SOLID | Single Responsibility | Each class one job |
| SOLID | Open/Closed | Extend without modifying |
| SOLID | Liskov Substitution | Swap implementations safely |
| SOLID | Interface Segregation | Focused interfaces |
| SOLID | Dependency Inversion | Depend on abstractions |
| GRASP | Creator | Create objects responsibly |
| GRASP | Information Expert | Assign to object with info |
| GRASP | Controller | Handle system operations |
| GRASP | Indirection | Avoid direct dependency |
| GRASP | Polymorphism | Handle variations |
| GRASP | Pure Fabrication | Create helper classes |
| GRASP | Protected Variations | Encapsulate what varies |

---

## Conclusion

Use this guide as a reference when analyzing code or designing new features. The decision tree and checklists will help you quickly identify which patterns or principles apply to your situation. Remember:

- Design patterns are templates for solving problems, not rules
- SOLID principles improve code quality and maintainability
- GRASP principles guide responsibility assignment
- Combine multiple patterns as needed for complex systems
- Don't over-engineer; use patterns when they solve real problems

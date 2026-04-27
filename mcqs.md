# Design Patterns and Principles - Multiple Choice Questions

## Difficulty: Easy (10 Questions)

### Question 1
What is the primary purpose of the Singleton pattern?

A) To create multiple instances of a class efficiently
B) To ensure only one instance of a class exists throughout the application
C) To allow multiple classes to share state
D) To create instances of different classes dynamically

**Answer:** B
**Explanation:** The Singleton pattern restricts the instantiation of a class to a single object. This is useful for resources like loggers, connection pools, or configuration managers that should exist as only one instance.

---

### Question 2
Which of the following is an example of a Creational pattern?

A) Facade
B) Proxy
C) Factory
D) Observer

**Answer:** C
**Explanation:** Factory is a Creational pattern that provides an interface for creating objects without specifying the exact classes. Facade and Proxy are Structural patterns, while Observer is a Behavioral pattern.

---

### Question 3
What does the Facade pattern do?

A) Restricts access to a class
B) Converts one interface to another
C) Hides complex subsystems behind a simple interface
D) Creates multiple instances of objects

**Answer:** C
**Explanation:** The Facade pattern provides a unified, simplified interface to a complex subsystem of classes, libraries, or frameworks. This simplifies client code.

---

### Question 4
Which SOLID principle states that a class should have only one reason to change?

A) Open/Closed Principle
B) Single Responsibility Principle
C) Liskov Substitution Principle
D) Dependency Inversion Principle

**Answer:** B
**Explanation:** The Single Responsibility Principle (S in SOLID) states that a class should have only one reason to change, meaning it should have only one responsibility.

---

### Question 5
What is the Chain of Responsibility pattern primarily used for?

A) Creating objects
B) Passing a request through a series of handlers
C) Defining a family of algorithms
D) Reducing class coupling

**Answer:** B
**Explanation:** The Chain of Responsibility pattern allows passing a request along a chain of handlers, where each handler decides to process it or pass it to the next handler.

---

### Question 6
Which GRASP principle assigns creation responsibility to the class that has the necessary data?

A) Information Expert
B) Creator
C) Controller
D) Polymorphism

**Answer:** B
**Explanation:** The Creator principle assigns object creation responsibility to the class that has the information needed to create the object.

---

### Question 7
What does the Iterator pattern allow you to do?

A) Create objects without specifying their types
B) Add new functionality to existing objects
C) Traverse through a collection without exposing its structure
D) Handle requests through a chain

**Answer:** C
**Explanation:** The Iterator pattern provides a way to access the elements of a collection without exposing its underlying structure (array, linked list, etc.).

---

### Question 8
In Spring framework, what annotation makes a class a Singleton bean?

A) @Entity
B) @Service
C) @Singleton
D) @Instance

**Answer:** B
**Explanation:** In Spring, @Service, @Component, and @Bean annotations create Singleton beans by default. Each is instantiated only once per application context.

---

### Question 9
Which principle states "open for extension, closed for modification"?

A) Single Responsibility Principle
B) Liskov Substitution Principle
C) Open/Closed Principle
D) Interface Segregation Principle

**Answer:** C
**Explanation:** The Open/Closed Principle (O in SOLID) states that software entities should be open for extension but closed for modification. This allows adding new features without changing existing code.

---

### Question 10
What is the main difference between Adapter and Decorator patterns?

A) Adapter changes behavior, Decorator changes structure
B) Adapter converts interfaces, Decorator adds functionality
C) They are exactly the same
D) Adapter adds functionality, Decorator converts interfaces

**Answer:** B
**Explanation:** The Adapter pattern makes incompatible interfaces work together by converting one interface to another. The Decorator pattern adds new functionality to existing objects while maintaining the same interface.

---

## Difficulty: Medium (15 Questions)

### Question 11
Which design pattern is used in Spring Security for request processing?

A) Factory
B) Chain of Responsibility
C) Observer
D) Strategy

**Answer:** B
**Explanation:** Spring Security uses the Chain of Responsibility pattern with a FilterChain where multiple filters process a request in sequence, each deciding whether to continue or stop.

---

### Question 12
What is a violation of the Dependency Inversion Principle?

A) Using constructor injection
B) Creating instances with `new ConcreteClass()`
C) Depending on abstract interfaces
D) Using Spring beans

**Answer:** B
**Explanation:** Directly instantiating concrete classes with `new` creates tight coupling. The Dependency Inversion Principle requires depending on abstractions (interfaces) rather than concrete implementations.

---

### Question 13
In your code, AuthService is an example of which pattern?

A) Factory Pattern
B) Strategy Pattern
C) Facade Pattern
D) Proxy Pattern

**Answer:** C
**Explanation:** AuthService is a Facade that hides multiple repositories (UserRepository, JwtProvider) behind a simple interface (register(), login() methods).

---

### Question 14
What does the Information Expert GRASP principle suggest?

A) The most knowledgeable object should handle the responsibility
B) An expert class should handle all responsibilities
C) Objects should share responsibilities equally
D) Controllers should handle all business logic

**Answer:** A
**Explanation:** The Information Expert principle assigns responsibility to the object that has the information necessary to fulfill that responsibility.

---

### Question 15
Which pattern allows you to define a family of algorithms and make them interchangeable?

A) State Pattern
B) Strategy Pattern
C) Template Method Pattern
D) Command Pattern

**Answer:** B
**Explanation:** The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It allows selecting an algorithm at runtime.

---

### Question 16
What is a code smell that indicates violation of Single Responsibility Principle?

A) Using dependency injection
B) Class description containing "and" (e.g., "UserAndEmailService")
C) Too many private methods
D) Implementing multiple interfaces

**Answer:** B
**Explanation:** If a class name contains "and", it usually indicates multiple responsibilities. For example, "UserService" (one responsibility) is better than "UserAndEmailService" (two responsibilities).

---

### Question 17
In Spring Data, Page<T> is an example of which pattern?

A) Factory
B) Iterator
C) Observer
D) Strategy

**Answer:** B
**Explanation:** Page<T> implements the Iterator pattern, allowing traversal through a paginated collection without exposing its structure.

---

### Question 18
Which pattern would you use if you want to add logging to an object without modifying its code?

A) Adapter Pattern
B) Decorator Pattern
C) Bridge Pattern
D) Facade Pattern

**Answer:** B
**Explanation:** The Decorator pattern allows adding new functionality (like logging) to existing objects dynamically without changing their implementation.

---

### Question 19
What is the purpose of the Builder pattern?

A) To create a single instance of a class
B) To handle complex object creation with many optional parameters
C) To traverse through collections
D) To define abstract algorithms

**Answer:** B
**Explanation:** The Builder pattern is useful for creating complex objects with many optional fields, providing a fluent interface like object.setField1().setField2().build().

---

### Question 20
Which GRASP principle suggests creating intermediary objects to avoid direct dependency?

A) Creator
B) Polymorphism
C) Indirection
D) Protected Variations

**Answer:** C
**Explanation:** The Indirection principle suggests inserting an intermediary object (like a service) between two objects to avoid direct coupling and improve flexibility.

---

### Question 21
What is the main goal of the Protected Variations principle?

A) To encrypt sensitive data
B) To identify and encapsulate what is likely to change
C) To prevent inheritance
D) To restrict access to methods

**Answer:** B
**Explanation:** Protected Variations suggests identifying what might change and encapsulating it, so variations in one part don't affect other parts of the system.

---

### Question 22
Which of the following violates the Interface Segregation Principle?

A) Having a focused RequestDTO with only email and password
B) Having a giant BaseService interface with 50 methods
C) Implementing multiple specific interfaces
D) Using composition instead of inheritance

**Answer:** B
**Explanation:** The Interface Segregation Principle states clients should not depend on interfaces they don't use. A giant BaseService with many methods violates this.

---

### Question 23
In the EduSphere LMS, JwtAuthenticationFilter is an example of which pattern?

A) Factory
B) Chain of Responsibility
C) Observer
D) Strategy

**Answer:** B
**Explanation:** JwtAuthenticationFilter is part of the Spring Security filter chain, implementing the Chain of Responsibility pattern where each filter decides to continue or stop the chain.

---

### Question 24
What does the Liskov Substitution Principle ensure?

A) Objects can be created efficiently
B) A subclass can replace its parent class without breaking the application
C) Objects have single responsibility
D) Classes are open for extension

**Answer:** B
**Explanation:** The Liskov Substitution Principle ensures that derived classes can be substituted for their base classes without breaking the code. The subclass must honor the contract of the parent.

---

### Question 25
Which pattern would you use for role-based access control (different payment methods)?

A) Factory
B) State
C) Strategy
D) Template Method

**Answer:** C
**Explanation:** The Strategy pattern is ideal for selecting different algorithms (payment methods) at runtime based on conditions, allowing clients to choose which strategy to use.

---

## Difficulty: Hard (15 Questions)

### Question 26
How do the Facade and Adapter patterns differ?

A) Facade is for creation, Adapter is for composition
B) Facade simplifies complex subsystems, Adapter makes incompatible interfaces work together
C) They are identical patterns with different names
D) Facade is structural, Adapter is behavioral

**Answer:** B
**Explanation:** Facade hides complexity by providing a simple interface to complex subsystems. Adapter makes incompatible interfaces work together. Both are structural but solve different problems.

---

### Question 27
Which architectural problem does the Template Method pattern solve?

A) How to create objects of multiple types
B) How to define an algorithm skeleton and let subclasses override specific steps
C) How to add behavior to objects dynamically
D) How to make interfaces work together

**Answer:** B
**Explanation:** The Template Method pattern defines the skeleton of an algorithm in a base class and lets subclasses override specific steps, promoting code reuse.

---

### Question 28
In your EduSphere code, StudentService and InstructorService are separate services. Which principle/pattern does this follow?

A) Facade Pattern
B) Single Responsibility Principle
C) Polymorphism
D) All of the above

**Answer:** D
**Explanation:** Separating StudentService and InstructorService follows Single Responsibility (each handles one domain), implements Facade (each hides multiple repos), and uses Polymorphism (both implement specific behaviors).

---

### Question 29
What is the consequence of violating the Dependency Inversion Principle?

A) Code is easier to test
B) Classes become tightly coupled and hard to modify
C) More code reusability
D) Better performance

**Answer:** B
**Explanation:** When classes depend directly on concrete implementations (not abstractions), they become tightly coupled. Changes to one class force changes to others, making the system brittle.

---

### Question 30
How would you implement the Observer pattern in Spring?

A) Use @Component and @Service annotations
B) Use ApplicationEventPublisher and @EventListener
C) Create Filter implementations
D) Use Repository interfaces

**Answer:** B
**Explanation:** Spring implements the Observer pattern using ApplicationEventPublisher to publish events and @EventListener to listen for those events. This decouples event producers from consumers.

---

### Question 31
Why might you use the Proxy pattern instead of directly accessing an object?

A) It's always faster than direct access
B) It allows controlling access, lazy loading, logging, or permission checking
C) It reduces the number of classes needed
D) It makes code less complex

**Answer:** B
**Explanation:** The Proxy pattern acts as a placeholder, allowing you to add behavior before accessing the real object, such as permission checking, logging, or lazy initialization.

---

### Question 32
In a validation scenario with Email, Password, and Name validators, which GRASP principle suggests creating these separate validator classes?

A) Creator
B) Polymorphism
C) Pure Fabrication
D) Protected Variations

**Answer:** C
**Explanation:** Pure Fabrication suggests creating artificial classes (like validators) for clean design when no natural object fits the responsibility.

---

### Question 33
How does the Bridge pattern differ from the Adapter pattern?

A) Bridge is for composition, Adapter is for conversion
B) Bridge separates abstraction from implementation, Adapter makes incompatible interfaces work
C) Bridge is easier to implement
D) They are the same pattern

**Answer:** B
**Explanation:** Bridge separates abstraction from implementation upfront (design time), while Adapter makes incompatible interfaces work together (usually at runtime, as a fix).

---

### Question 34
What is the relationship between SOLID principles and design patterns?

A) SOLID principles are stricter than patterns
B) Patterns are instances of SOLID principles in practice
C) They are unrelated
D) SOLID principles replace design patterns

**Answer:** B
**Explanation:** Design patterns are concrete implementations that help achieve SOLID principles. For example, the Facade pattern helps achieve Single Responsibility by separating concerns.

---

### Question 35
In GlobalExceptionHandler, how is the Open/Closed Principle demonstrated?

A) By preventing any modifications
B) By adding new @ExceptionHandler methods without modifying existing ones
C) By restricting inheritance
D) By eliminating all exception handling

**Answer:** B
**Explanation:** GlobalExceptionHandler is open for extension (add new @ExceptionHandler methods) but closed for modification (existing handlers don't need to change when adding new ones).

---

### Question 36
How would you identify if a class violates the Interface Segregation Principle?

A) If it has more than 10 methods
B) If clients don't use all the methods in the interface it implements
C) If it extends another class
D) If it uses constructor injection

**Answer:** B
**Explanation:** Interface Segregation is violated when a client is forced to depend on methods it doesn't use. This indicates the interface is too broad and should be split.

---

### Question 37
What makes JwtProvider a good example of the Creator principle?

A) It creates AuthService instances
B) It has a public constructor
C) It has the secret key information necessary to create JWT tokens
D) It implements Serializable

**Answer:** C
**Explanation:** JwtProvider is the Creator of JWT tokens because it possesses all the necessary information (secret key) to create them securely.

---

### Question 38
How do State and Strategy patterns appear similar but solve different problems?

A) State is for composition, Strategy is for inheritance
B) State changes behavior based on internal state changes, Strategy is for interchangeable algorithms
C) They are identical
D) Strategy is more powerful than State

**Answer:** B
**Explanation:** Both use polymorphism, but State pattern is about an object changing its behavior as its internal state changes (submission workflow). Strategy is about selecting different algorithms at runtime.

---

### Question 39
In security architecture, JwtAuthenticationFilter demonstrates which GRASP principle?

A) Creator
B) Controller
C) Information Expert
D) Indirection

**Answer:** C
**Explanation:** JwtAuthenticationFilter is an Information Expert because it has all the information needed (the token, validation logic) to authenticate requests.

---

### Question 40
What is a real-world consequence of not following the Protected Variations principle?

A) Code is less readable
B) Changes in database technology would ripple through entire application
C) More memory is used
D) Compilation takes longer

**Answer:** B
**Explanation:** Without Protected Variations, variations (like database changes) directly affect multiple parts of the system. With it, database changes only affect the data layer.

---

## Answer Key Quick Reference

**Easy (1-10):** B, C, C, B, B, B, C, B, C, B

**Medium (11-25):** B, B, C, A, B, B, B, B, B, C, B, B, C, B, C

**Hard (26-40):** B, B, D, B, B, B, C, B, B, B, B, C, B, B, B

---

## Recommended Study Strategy

### By Level:
1. Start with Easy questions to understand fundamental concepts
2. Move to Medium questions after understanding basics
3. Challenge yourself with Hard questions for deep comprehension

### By Topic:
- Questions 1-10: Basic pattern/principle concepts
- Questions 11-20: Application to code and practice
- Questions 21-30: Principles and architecture
- Questions 31-40: Design decisions and trade-offs

### Study Tips:
1. Don't just memorize answers - understand the "why"
2. Try to identify patterns in your own code
3. Group related questions together
4. Review wrong answers multiple times
5. Create your own questions from the guide
6. Discuss answers with peers

---

## Topic-Wise Breakdown

### Creational Patterns Questions:
1, 2, 19, 26

### Structural Patterns Questions:
3, 10, 18, 27, 33

### Behavioral Patterns Questions:
5, 7, 11, 15, 17, 23, 38

### SOLID Principles Questions:
4, 9, 12, 16, 21, 22, 24, 29, 35, 36

### GRASP Principles Questions:
6, 14, 20, 25, 28, 32, 34, 37, 39, 40

### Code-Specific Questions:
13, 23, 28, 31, 35, 37, 39, 40

---

## Practice Test Combinations

### Test 1: Fundamentals (20 mins)
Questions: 1, 2, 4, 5, 6, 7, 8, 9, 10, 14
Expected Score: 80% or higher

### Test 2: Application (30 mins)
Questions: 11, 13, 15, 17, 18, 19, 20, 23, 26, 27
Expected Score: 70% or higher

### Test 3: Expert Level (40 mins)
Questions: 12, 16, 21, 22, 24, 25, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40
Expected Score: 60% or higher

### Test 4: Comprehensive (60 mins)
All 40 questions - mix of all difficulties and topics
Expected Score: 75% or higher indicates readiness

---

## Additional Resources

Reference the following sections from the Design Patterns Guide:
- For Creational Pattern questions: See "Creational Patterns" section
- For Structural Pattern questions: See "Structural Patterns" section
- For Behavioral Pattern questions: See "Behavioral Patterns" section
- For SOLID questions: See "SOLID Principles" section
- For GRASP questions: See "GRASP Principles" section
- For decision-making: See "Decision Tree" section

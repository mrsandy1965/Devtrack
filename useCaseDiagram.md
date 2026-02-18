# Use Case Diagram
```mermaid
usecaseDiagram
    actor "Student" as S
    package "DevTrack System" {
        usecase "Register / Login" as UC1
        usecase "Connect GitHub" as UC2
        usecase "Track Habits" as UC3
        usecase "Log Focus Sessions" as UC4
        usecase "Apply for Internships" as UC5
        usecase "View Career Score" as UC6
        usecase "View Analytics" as UC7
    }

    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5
    S --> UC6
    S --> UC7

    UC2 ..> UC7 : <<include>>
    UC3 ..> UC7 : <<include>>
    UC4 ..> UC7 : <<include>>
    UC5 ..> UC7 : <<include>>
```
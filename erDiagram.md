# ER-Diagram

```mermaid
erDiagram

USER {
    string id PK
    string name
    string email
    string password
    string githubUsername
    int careerScore
}

HABIT {
    string id PK
    string userId FK
    string title
    string type
    string recurrence
    int streak
}

HABIT_LOG {
    string id PK
    string habitId FK
    date logDate
    int commitCount
}

INTERNSHIP_APPLICATION {
    string id PK
    string userId FK
    string companyName
    string role
    string status
    date appliedDate
}

FOCUS_SESSION {
    string id PK
    string userId FK
    int duration
    date sessionDate
    string notes
}

USER ||--o{ HABIT : creates
HABIT ||--o{ HABIT_LOG : has
USER ||--o{ INTERNSHIP_APPLICATION : applies
USER ||--o{ FOCUS_SESSION : logs


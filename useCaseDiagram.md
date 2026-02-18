# Use Case Diagram – DevTrack (Strict UML Style)

```mermaid
flowchart LR

%% Actors
User((User))
GitHub[(GitHub API)]

%% System Boundary
subgraph DevTrack System

UC1([Register])
UC2([Login])
UC3([Connect GitHub])
UC4([Sync GitHub Activity])
UC5([Create Habit])
UC6([Log Habit Activity])
UC7([Calculate Streak])
UC8([Add Internship Application])
UC9([Update Application Status])
UC10([Calculate Career Score])
UC11([View Dashboard])
UC12([Start Focus Session])

end

%% Actor Associations
User --> UC1
User --> UC2
User --> UC3
User --> UC5
User --> UC6
User --> UC8
User --> UC9
User --> UC11
User --> UC12

%% External System Interaction
UC4 --> GitHub

%% Include Relationships
UC3 -. "<<include>>" .-> UC4
UC6 -. "<<include>>" .-> UC7
UC11 -. "<<include>>" .-> UC10

%% Extend Relationships
UC4 -. "<<extend>>" .-> UC6
UC12 -. "<<extend>>" .-> UC6
UC9 -. "<<extend>>" .-> UC10


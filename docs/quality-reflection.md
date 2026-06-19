# Quality Reflection

### 1. Do you write tests in your own projects?
Yes, but my approach depends on the type of system I’m working on. During my work at Thales on projects like SQL Data Guard and Data Trap Honeypot, testing was not an optional layer—it was part of the core logic because we were dealing with query validation and behavior simulation.

In SQL Data Guard, I worked on modules that parse and validate SQL queries before they reach the database. Here, I used pytest heavily to validate rule-based query blocking logic, especially for edge cases like nested queries, invalid syntax, and recursive parsing issues. I also wrote tests to ensure that restricted patterns were correctly detected using AST-based parsing with sqlglot. Since a small mistake could allow a blocked query through, I focused on writing tests around security-critical flows rather than just function correctness.

In the Data Trap Honeypot project, testing became even more important because the system was designed to simulate real database behavior and observe attacker-style queries. I wrote pytest-based test cases to compare real MySQL/PostgreSQL outputs with honeypot responses, ensuring behavioral consistency. I also used fixtures, parametrize, and monkeypatch to simulate different query types like SELECT, multi-statements, and invalid payloads without depending on external systems.

Across both projects, I didn’t treat testing as a separate phase. I used it to validate data integrity, query safety, and system behavior under edge cases, especially where failures could silently break logic or security rules.

So overall, I don’t write tests just for coverage—I write them when the system involves critical data flow, security rules, or complex logic that can fail silently if not validated properly.

### 2. A time I shipped something not fully tested
During my work on the Data Trap Honeypot testing module, I once validated SQL query responses using a limited dataset that closely matched expected inputs from MySQL and PostgreSQL. The tests passed locally because they covered standard SELECT and simple query flows.

However, when the same logic was later integrated with more complex scenarios—like multi-statement queries and recursive validation cases—I noticed gaps in how edge conditions were handled. Some malformed or deeply nested queries were not being caught properly because my initial tests were too aligned with “normal” database behavior.

That incident made it clear that testing only predictable inputs gives a false sense of correctness, especially in systems dealing with external or adversarial inputs. After that, I shifted my approach to include unexpected query structures, invalid patterns, and stress-style test cases using pytest parametrization and randomized inputs, so the system behavior is validated beyond standard usage.

This directly changed how I think about testing now—I no longer validate what I expect users to do, I validate what the system does when users behave unpredictably or maliciously.

### 3. What does this team need MOST right now?
The team doesn’t need more developers or faster feature work right now—they need a basic safety net around payroll logic for the New Developer.

Right now, the Senior Dev can still manage because he knows the system from experience, but that knowledge is not shared or visible. The New Dev is the real risk point because they are shipping changes without understanding hidden dependencies in salary, attendance, and overtime flow. That’s exactly how silent payroll bugs happen.

If I had to choose one thing, it would be a fast CI pipeline with core regression tests around salary calculation and attendance-to-payroll flow. Not a heavy test suite—just enough to prevent accidental breakage. Once the New Dev gets confidence that “I can’t break payroll without knowing it,” the whole team naturally becomes faster without increasing risk.

### 4. Getting the Senior Dev to care
I would not try to convince him with theory or testing metrics, because clearly he already acts as a manual safety layer for the system.

Instead, I would treat his knowledge as the baseline truth of the system. In the first week, I would sit with him and map out the critical payroll flows—what actually breaks salary, what dependencies exist between attendance, overtime, and payslips, and what are the “hidden rules” only he knows.

Then I would convert those exact flows into small automated regression tests, and position it as:
“This is not replacing your judgment—it is capturing it so the New Dev doesn’t accidentally break what you already know.”

The goal is not to challenge him, but to remove the constant interruption where he has to fix avoidable mistakes. Over time, when he sees fewer repeated issues reaching him, he naturally starts trusting the system because it reduces his own workload without slowing him down.

### 5. Connecting test strategy to something personal
Earlier, I used to depend on memory and reminders to manage small daily tasks. I would plan things in my head or write quick notes, but I still ended up missing a few things when I got busy or distracted.

Later, I changed it to a more fixed system—simple schedules and automatic reminders—so I didn’t have to think every time. Things started happening on their own without me relying on memory.

That’s how I see testing and quality in systems too. If everything depends on people remembering or being careful, mistakes will happen. But if the system itself has checks built in, then errors get caught automatically and things stay reliable even when people are busy or under pressure.
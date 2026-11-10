# AI Usage Appendix — SIS #04 Smart Campus

## 1. AI Reflection

**1. How was AI used in this project?**

AI tools were used as development assistants during the Smart Campus project. ChatGPT helped analyze the assignment requirements, plan the refactoring steps, explain implementation decisions, and troubleshoot development issues. Bolt was used to implement parts of the room filtering interface.

**2. Which AI suggestions were useful or incorrect?**

The most useful suggestions involved separating availability and filtering logic into independent modules, adding boundary tests, and connecting equipment filters to the room catalog. AI-generated changes still required review before being accepted.

**3. How did you verify the AI-generated work?**

I reviewed the modified source files, checked the application in the Bolt preview, and ran the project commands locally. I also inspected the test results and confirmed that the production build completed successfully.

**4. How did AI affect testing?**

AI helped identify important edge cases, including maximum booking duration, adjacent booking intervals, blocked rooms, equipment requirements, and changing the selected room. These cases were covered by the automated test suites.

**5. What would you improve next time?**

I would define the project architecture and acceptance criteria earlier, write tests alongside each feature, and review AI-generated changes in smaller increments. I would also keep documentation and evidence updated throughout development instead of waiting until the final stage.

## 2. AI Usage Journal

| Tool | Date | Purpose and prompt summary | Output used | Verification |
|---|---|---|---|---|
| ChatGPT | 2026-11-10 | Analyze requirements and plan project implementation | Step-by-step development plan and technical guidance | Compared with assignment requirements |
| ChatGPT | 2026-11-10 | Help refactor availability and design test coverage | Validation guidance and test scenarios | Ran Vitest, TypeScript and build commands |
| Bolt | 2026-11-10 | Implement room capacity and equipment filtering in the UI | Updated `src/App.tsx` with filter controls and empty state | Reviewed in Preview and tested locally |
| ChatGPT | 2026-11-10 | Troubleshoot Git synchronization and prepare documentation | Git guidance and report structure | Confirmed GitHub synchronization and local command results |

## 3. Problems and Adjustments

- Bolt's workspace did not allow the required Git operations, so the updated project files were exported and transferred to the local repository.
- The first test command was executed from the export directory, where dependencies were not installed. It was rerun successfully from the local project directory.
- Git initially rejected the push because the remote branch contained additional commits. The branches were synchronized using rebase.
- ESLint displayed a TypeScript compatibility warning. No forced dependency upgrades were performed.

## 4. Final Verification

- Automated tests: 28/28 passed.
- TypeScript typecheck: passed.
- ESLint: completed without lint errors.
- Production build: successful.
- GitHub repository: synchronized.
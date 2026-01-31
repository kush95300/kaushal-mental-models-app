/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateTaskInput } from "../src/lib/validation";

function runTests() {
  console.log("Running validation tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ ${message}`);
      passed++;
    } else {
      console.error(`❌ ${message}`);
      failed++;
    }
  }

  // Valid cases
  assert(validateTaskInput({ content: "Valid task" }).isValid, "Valid content");
  assert(validateTaskInput({ quadrant: "INBOX" }).isValid, "Valid quadrant INBOX");
  assert(validateTaskInput({ quadrant: "DO" }).isValid, "Valid quadrant DO");
  assert(validateTaskInput({ status: "TODO" }).isValid, "Valid status TODO");
  assert(validateTaskInput({ estimatedMinutes: 30 }).isValid, "Valid estimatedMinutes");

  // Invalid cases - Content
  assert(!validateTaskInput({ content: "" }).isValid, "Invalid content (empty)");
  assert(!validateTaskInput({ content: "a".repeat(1001) }).isValid, "Invalid content (too long)");
  assert(!validateTaskInput({ content: 123 as any }).isValid, "Invalid content (wrong type)");

  // Invalid cases - Quadrant
  assert(!validateTaskInput({ quadrant: "INVALID" }).isValid, "Invalid quadrant");

  // Invalid cases - Status
  assert(!validateTaskInput({ status: "ARCHIVED" }).isValid, "Invalid status");

  // Invalid cases - Estimated Minutes
  assert(!validateTaskInput({ estimatedMinutes: -1 }).isValid, "Invalid estimatedMinutes (negative)");
  assert(!validateTaskInput({ estimatedMinutes: 1.5 }).isValid, "Invalid estimatedMinutes (float)");
  assert(!validateTaskInput({ estimatedMinutes: "10" as any }).isValid, "Invalid estimatedMinutes (string)");

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();

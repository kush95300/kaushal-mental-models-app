import { validateTaskInput } from "../src/lib/validation";

const runTests = () => {
  console.log("Running validation tests...");
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  };

  // Test 1: Valid task creation
  const validTask = {
    content: "Valid Task",
    quadrant: "INBOX",
    status: "TODO"
  };
  assert(validateTaskInput(validTask, true).success === true, "Valid task creation");

  // Test 2: Invalid task creation (empty content)
  const invalidTaskEmpty = {
    content: "   ",
    quadrant: "INBOX"
  };
  const res2 = validateTaskInput(invalidTaskEmpty, true);
  assert(res2.success === false && res2.error === "Content cannot be empty", "Invalid task (empty content)");

  // Test 3: Invalid task creation (missing content)
  const invalidTaskMissing = {
    quadrant: "INBOX"
  };
  const res3 = validateTaskInput(invalidTaskMissing, true);
  assert(res3.success === false && res3.error === "Content is required and must be a string", "Invalid task (missing content)");

  // Test 4: Valid update (partial)
  const validUpdate = {
    status: "DONE"
  };
  assert(validateTaskInput(validUpdate, false).success === true, "Valid update");

  // Test 5: Invalid update (bad quadrant)
  const invalidUpdateQuadrant = {
    quadrant: "INVALID_QUADRANT"
  };
  const res5 = validateTaskInput(invalidUpdateQuadrant, false);
  assert(res5.success === false && res5.error === "Invalid quadrant", "Invalid update (bad quadrant)");

  // Test 6: Long content
  const longContent = "a".repeat(1001);
  const invalidTaskLong = {
    content: longContent
  };
  const res6 = validateTaskInput(invalidTaskLong, true);
  assert(res6.success === false && res6.error === "Content cannot exceed 1000 characters", "Invalid task (long content)");

   // Test 7: Invalid estimatedMinutes
  const invalidMinutes = {
    content: "Test",
    estimatedMinutes: -5
  };
  const res7 = validateTaskInput(invalidMinutes, true);
  assert(res7.success === false && res7.error === "Estimated minutes must be a non-negative integer", "Invalid task (negative minutes)");

   // Test 8: Invalid status
  const invalidStatus = {
    status: "IN_PROGRESS"
  };
  const res8 = validateTaskInput(invalidStatus, false);
  assert(res8.success === false && res8.error === "Invalid status", "Invalid update (bad status)");


  console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
};

runTests();

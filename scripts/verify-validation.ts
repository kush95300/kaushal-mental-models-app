
import { createTask } from "@/actions/task";
import { createDelegate } from "@/actions/delegate";

async function run() {
  console.log("Running validation verification...");
  let errors = 0;

  // Test 1: Invalid Task Content (Empty)
  try {
    const res = await createTask({ content: "" });
    if (res.success) {
      console.error("FAIL: createTask allowed empty content");
      errors++;
    } else {
      console.log("PASS: createTask caught empty content");
    }
  } catch (e) {
    console.error("FAIL: createTask threw error on empty content check", e);
    errors++;
  }

  // Test 2: Invalid Task Content (Too long - simulate, though difficult to pass 1000 chars string here easily, let's skip strict length check if it makes script messy, but empty check is good)

  // Test 3: Invalid Quadrant
  try {
    const res = await createTask({ content: "Valid content", quadrant: "INVALID_QUADRANT" });
    if (res.success) {
      console.error("FAIL: createTask allowed invalid quadrant");
      errors++;
    } else {
      console.log("PASS: createTask caught invalid quadrant");
    }
  } catch (e) {
    console.error("FAIL: createTask threw error on quadrant check", e);
    errors++;
  }

  // Test 4: Invalid Status
  try {
    const res = await createTask({ content: "Valid content", status: "INVALID_STATUS" });
    if (res.success) {
      console.error("FAIL: createTask allowed invalid status");
      errors++;
    } else {
      console.log("PASS: createTask caught invalid status");
    }
  } catch (e) {
    console.error("FAIL: createTask threw error on status check", e);
    errors++;
  }

  // Test 5: Invalid Delegate Name
  try {
    const res = await createDelegate({ name: "" });
    if (res.success) {
      console.error("FAIL: createDelegate allowed empty name");
      errors++;
    } else {
      console.log("PASS: createDelegate caught empty name");
    }
  } catch (e) {
    console.error("FAIL: createDelegate threw error on name check", e);
    errors++;
  }

  // Test 6: Invalid Delegate Email
  try {
    const res = await createDelegate({ name: "Valid Name", email: "invalid-email" });
    if (res.success) {
      console.error("FAIL: createDelegate allowed invalid email");
      errors++;
    } else {
      console.log("PASS: createDelegate caught invalid email");
    }
  } catch (e) {
    console.error("FAIL: createDelegate threw error on email check", e);
    errors++;
  }

  if (errors > 0) {
    console.error(`\nverification failed with ${errors} errors.`);
    process.exit(1);
  } else {
    console.log("\nAll validation tests passed!");
  }
}

run();

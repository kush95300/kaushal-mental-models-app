import { createTask } from "../src/actions/task";
import { createDelegate } from "../src/actions/delegate";

// Ensure DATABASE_URL is set for Prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:../dev.db";

async function verify() {
  console.log("🛡️ Sentinel: Verifying Input Validation...");

  let errors = 0;

  // 1. Test Empty Content
  console.log("Testing Empty Task Content...");
  const emptyTask = await createTask({ content: "" });
  if (emptyTask.success) {
    console.error("❌ Failed: Empty task content should be rejected");
    errors++;
  } else if (emptyTask.error === "Task content cannot be empty") {
    console.log("✅ Passed: Empty task content rejected correctly");
  } else {
    console.error(`❌ Failed: Unexpected error message: ${emptyTask.error}`);
    errors++;
  }

  // 2. Test Long Content
  console.log("Testing Long Task Content...");
  const longContent = "a".repeat(1001);
  const longTask = await createTask({ content: longContent });
  if (longTask.success) {
    console.error("❌ Failed: Long task content should be rejected");
    errors++;
  } else if (longTask.error === "Task content cannot exceed 1000 characters") {
    console.log("✅ Passed: Long task content rejected correctly");
  } else {
    console.error(`❌ Failed: Unexpected error message: ${longTask.error}`);
    errors++;
  }

  // 3. Test Invalid Minutes
  console.log("Testing Invalid Minutes...");
  const invalidMinutes = await createTask({ content: "Valid", estimatedMinutes: -1 });
  if (invalidMinutes.success) {
    console.error("❌ Failed: Negative minutes should be rejected");
    errors++;
  } else if (invalidMinutes.error === "Minutes cannot be negative") {
    console.log("✅ Passed: Negative minutes rejected correctly");
  } else {
     console.error(`❌ Failed: Unexpected error message: ${invalidMinutes.error}`);
     errors++;
  }

  // 4. Test Empty Delegate Name
  console.log("Testing Empty Delegate Name...");
  const emptyDelegate = await createDelegate({ name: "" });
  if (emptyDelegate.success) {
    console.error("❌ Failed: Empty delegate name should be rejected");
    errors++;
  } else if (emptyDelegate.error === "Delegate name cannot be empty") {
    console.log("✅ Passed: Empty delegate name rejected correctly");
  } else {
    console.error(`❌ Failed: Unexpected error message: ${emptyDelegate.error}`);
    errors++;
  }

  // 5. Test Invalid Email
  console.log("Testing Invalid Email...");
  const invalidEmail = await createDelegate({ name: "Bob", email: "not-an-email" });
  if (invalidEmail.success) {
    console.error("❌ Failed: Invalid email should be rejected");
    errors++;
  } else if (invalidEmail.error === "Invalid email format") {
    console.log("✅ Passed: Invalid email rejected correctly");
  } else {
    console.error(`❌ Failed: Unexpected error message: ${invalidEmail.error}`);
    errors++;
  }

  if (errors > 0) {
    console.error(`\n❌ Validation Verification Failed with ${errors} errors.`);
    process.exit(1);
  } else {
    console.log("\n✅ All security validations passed!");
    process.exit(0);
  }
}

verify().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});

// NOTE - Switching to a new way to run retention jobs using admin login since hosting service charges for a cron job set up; keep this file commented out for reference.
// // NOTE - this will run retentionJobs in Prod

// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

// const { runRetentionJobs } = require("./retentionJobs");

// (async () => {
//   try {
//     console.log("Starting retention job...");
//     await runRetentionJobs();
//     console.log("Retention job completed successfully");
//     process.exit(0);
//   } catch (err) {
//     console.error("Retention job failed:", err);
//     process.exit(1);
//   }
// })();

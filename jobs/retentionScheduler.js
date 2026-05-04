// // const cron = require("node-cron");
// const { runRetentionJobs } = require("./retentionJobs");

// // // Schedule to run every day at 2:00 AM server time
// // cron.schedule(
// //   "0 2 * * *",
// //   async () => {
// //     try {
// //       await runRetentionJobs();
// //     } catch (err) {
// //       console.error("Unexpected error in daily retention job:", err);
// //     }
// //   },
// //   {
// //     timezone: "America/New_York", // adjust to your server timezone
// //   },
// // );

// // NOTE - New trigger for retention checks - see comments in bootstrap.js!
// const startRetentionScheduler = async () => {
//   try {
//     await runRetentionJobs();
//   } catch (err) {
//     console.error("Unexpected error in retention job:", err);
//   }
// };

// module.exports = { startRetentionScheduler };
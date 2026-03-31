const cron = require("node-cron");
const { runRetentionJobs } = require("../jobs/retentionJobs");

// Schedule to run every day at 2:00 AM server time
cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("Starting daily retention job...");
    try {
      await runRetentionJobs();
    } catch (err) {
      console.error("Unexpected error in daily retention job:", err);
    }
  },
  {
    timezone: "America/New_York", // adjust to your server timezone
  },
);

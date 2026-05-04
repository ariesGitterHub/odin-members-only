// NOTE - Use this in Dev, creating a new set up for Prod. See /jobs/runProdRetentionJobs

const cron = require("node-cron");
const { runRetentionJobs } = require("../jobs/retentionJobs");

// Schedule to run every day at 2:00 AM server time
cron.schedule(
  "0 2 * * *",
  async () => {
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

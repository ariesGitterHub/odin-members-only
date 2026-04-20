require("dotenv").config();
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const app = require("../app");

const { runRetentionJobs } = require("../jobs/retentionJobs");
require("../cron/retentionScheduler");

// console.log("DATABASE_URL:", process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`👂 Listening on port ${PORT}`);

  try {
    await runRetentionJobs();
    console.log("Retention job run on server start");
  } catch (err) {
    console.error("Error running retention job on startup:", err);
  }
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

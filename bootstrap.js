if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = require("./app");

// If this file starts a cron scheduler, prefer explicit init
// NOTE - use below for DEV, use /jobs/runProdRetentionJobs for Prod using Render dashboard cron job
require("./cron/retentionScheduler");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`👂 Listening on port ${PORT}`);

  // setImmediate(async () => {
  //   try {
  //     await runRetentionJobs();
  //     console.log("Retention job run on server start");
  //   } catch (err) {
  //     console.error("Error running retention job on startup:", err);
  //   }
  // });
});

// Graceful shutdown (important for Render restarts)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

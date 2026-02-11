/**
 * Scheduled cleanup of expired messages for the Neighborhood Message Board
 * - Soft-deletes expired messages
 * - Hard-deletes messages older than X days
 * Uses node-cron to run daily at midnight
 */

const cron = require("node-cron");
const { cleanupMessages } = require("../db/queries");

/**
 * Helper function to run the cleanup
 * Can be called manually or by the scheduled cron
 */
async function runCleanup() {
  try {
    const result = await cleanupMessages(30); // 30 days default
    console.log(`[${new Date().toISOString()}] Cleanup finished:`, result);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Cleanup failed:`, err);
  }
}

// Schedule daily cleanup at midnight (00:00)
cron.schedule("0 0 * * *", function () {
  console.log(`[${new Date().toISOString()}] Running daily cleanup...`);
  runCleanup();
});

// Export the function for manual runs or tests
module.exports = { runCleanup };

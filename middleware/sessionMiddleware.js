// const pool = require("../db/pool"); // Import your database pool

// // Middleware to validate session token
// const validateSession = async (req, res, next) => {
//   const sessionToken = req.cookies.session_token; // Get session token from cookie

//   if (!sessionToken) {
//     return res.status(401).send("No session token provided.");
//   }

//   try {
//     // Query the `sessions` table to check if the session is valid and not expired
//     const { rows } = await pool.query(
//       "SELECT * FROM sessions WHERE session_token = $1 AND expires_at > NOW()",
//       [sessionToken],
//     );

//     if (rows.length === 0) {
//       return res.status(401).send("Session expired or invalid.");
//     }

//     const session = rows[0];
//     const userId = session.user_id;

//     // Attach the user object to the request, making it available in the next middleware/route handler
//     const { rows: userRows } = await pool.query(
//       "SELECT * FROM users WHERE id = $1",
//       [userId],
//     );
//     req.user = userRows[0];

//     // Proceed to the next middleware/route handler
//     next();
//   } catch (err) {
//     return res.status(500).send("Internal server error.");
//   }
// };

// module.exports = { validateSession };


// middleware/sessionMiddleware.js

const pool = require("../db/pool"); // Import your database pool

// Middleware to validate session token
const validateSession = async (req, res, next) => {
  console.log("Cookies:", req.cookies);  // Debugging: Check what cookies are available

  const sessionToken = req.cookies.session_token;

  if (!sessionToken) {
    return res.status(401).send("No session token provided."); // Error if no session token is found
  }

  try {
    // Check if the session token exists and is not expired
    const { rows } = await pool.query(
      "SELECT * FROM sessions WHERE session_token = $1 AND expires_at > NOW()",
      [sessionToken]
    );

    if (rows.length === 0) {
      return res.status(401).send("Session expired or invalid.");
    }

    const session = rows[0];
    const userId = session.user_id;

    // Attach the user information to the request object
    const { rows: userRows } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    req.user = userRows[0];  // Attach the user data

    next();  // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Error during session validation:", err);
    return res.status(500).send("Internal server error.");
  }
};

module.exports = { validateSession };
// // Passport LocalStrategy + serialize/deserialize

// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcryptjs');
// const pool = require('../db/pool'); // Import connection pool

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const { rows } = await pool.query(
//         "SELECT * FROM users WHERE username = $1",
//         [username],
//       );
//       const user = rows[0];

//       if (!user) return done(null, false, { message: "Incorrect username." });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return done(null, false, { message: "Incorrect password." });

//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }),
// );

// // -- Serialize / Deserialize

// // Serialize user information into the session (store user ID in session)
// passport.serializeUser((user, done) => done(null, user.id));

// // Deserialize user information from the session (retrieve user data)
// passport.deserializeUser(async (id, done) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
//       id,
//     ]);
//     done(null, rows[0]);
//   } catch (err) {
//     done(err);
//   }
// }); 

// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('../db/pool'); // Import connection pool

// Passport LocalStrategy for username/password authentication
// passport.use(
//   new LocalStrategy(async (email, password, done) => {
//     try {
//       console.log("Attempting to find user with email:", email); // Add debug log
//       // Query the database to find the user by username
//       const { rows } = await pool.query(
//         "SELECT * FROM users WHERE email = $1",
//         [email],
//       );

//       // If no user is found, return an error
//       if (rows.length === 0) {
//         console.log("No user found with that email:", email); // Log if no user
//         return done(null, false, { message: "Incorrect email." });
//       }

//       const user = rows[0];

//       // Compare the provided password with the stored hashed password
//       const isMatch = await bcrypt.compare(password, user.password_hash);
//       if (!isMatch) {
//          console.log("Password mismatch for user:", email);
//         return done(null, false, { message: "Incorrect password." });
//       }

//       // Authentication successful, pass the user to done
//       return done(null, user);
//     } catch (err) {
//       // Handle database errors or other issues
//       console.error('Error during authentication: ', err);
//       return done(err);
//     }
//   })
// );

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log("Trying to authenticate:", email); // Debug log

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email],
        );

        if (rows.length === 0) {
          console.log("No user found for email:", email); // Debug log
          return done(null, false, { message: "Incorrect email." });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log("Password match:", isMatch); // Debug log

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    },
  ),
);

// -- Serialize and Deserialize User

// Serialize user information into the session (store user ID and permission status)
// passport.serializeUser((user, done) => {
//   done(null, { id: user.id, permission_status: user.permission_status });
// });
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
  done(null, user.id);
});

// Deserialize user information from the session (retrieve user data)
// passport.deserializeUser(async (sessionData, done) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [sessionData.id]);
//     const user = rows[0];
//     done(null, user);  // Attach full user object (including permission status)
//   } catch (err) {
//     done(err);
//   }
// });
// passport.deserializeUser(async (id, done) => {
//   // `id` is passed from the session
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
//       id,
//     ]);
//     if (rows.length > 0) {
//       done(null, rows[0]); // Pass the user object (including permission_status) to `req.user`
//     } else {
//       done(new Error("User not found"), null);
//     }
//   } catch (err) {
//     done(err);
//   }
// });
// passport.deserializeUser(async (id, done) => {
//    console.log("Deserializing user:", id);
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
//       id,
//     ]);

//     if (rows.length === 0) {
//       return done(null, false);
//     }

//     done(null, rows[0]);
//   } catch (err) {
//     done(err);
//   }
// });
passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user:", id);
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        users.*,
        user_profiles.avatar_type,
        user_profiles.avatar_color_fg,
        user_profiles.avatar_color_bg_top,
        user_profiles.avatar_color_bg_bottom,
        user_profiles.verified_by_admin,
        user_profiles.phone,
        user_profiles.street_address,
        user_profiles.apt_unit,
        user_profiles.city,
        user_profiles.us_state,
        user_profiles.zip_code
      FROM users
      LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
      WHERE users.id = $1
      `,
      [id],
    );

    if (!rows[0]) {
      return done(null, false);
    }

    done(null, rows[0]); // full user + profile
  } catch (err) {
    done(err);
  }
});

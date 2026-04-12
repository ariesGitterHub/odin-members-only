const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const { rows } = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
          );

          if (rows.length === 0) {
            return done(null, false, { message: "Incorrect email." });
          }

          const user = rows[0];
          const isMatch = await bcrypt.compare(password, user.password_hash);

          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // SERIALIZE USER
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // DESERIALIZE USER (CREATES req.user)
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query(
        `
        SELECT u.id, u.email, u.permission_status, u.verified_by_admin, u.guest_upgrade_invite, u.invite_decision, u.is_active, up.avatar_type
        FROM users AS u
        LEFT JOIN user_profiles AS up
          ON u.id = up.user_id
        WHERE id = $1
      `,
        [id],
      );

      if (!rows[0]) {
        return done(null, false);
      }

      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  });
};

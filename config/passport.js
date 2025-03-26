const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            fullName: profile.displayName || "Google User",
            email: profile.emails?.[0]?.value || null, // Handle missing email
            avatar: profile.photos?.[0]?.value || null, // Handle missing avatar
            isOAuthUser: true,
          });

          await user.save();
        }

        // Prevent redirecting with undefined
        if (!user._id) {
          return done(new Error("User ID is missing"), null);
        }

        // If the user has no role, flag them for role selection
        if (!user.role) {
          return done(null, { ...user.toObject(), needsRoleSelection: true });
        }

        return done(null, user);
      } catch (err) {
        console.error("OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user (store only user ID in session)
passport.serializeUser((user, done) => {
  done(null, user._id.toString()); // Ensure ID is a string
});

// Deserialize user (retrieve from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(new Error("User not found"), null);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

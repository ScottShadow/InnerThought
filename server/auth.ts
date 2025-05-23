import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { InsertUser, User } from "@shared/schema";
import PgSession from "connect-pg-simple";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isSubscribed?: boolean;
    }
  }
}

export function setupAuth(app: express.Express) {
  // Set up session storage
  const PgStore = PgSession(session);
  
  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "mindjournal-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: false,
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize and deserialize user
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        username: user.username,
        isSubscribed: user.isSubscribed,
      });
    } catch (err) {
      done(err, false);
    }
  });

  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, {
          id: user.id,
          username: user.username,
          isSubscribed: user.isSubscribed,
        });
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            const existingUser = await storage.getUserByGoogleId(profile.id);
            
            if (existingUser) {
              return done(null, {
                id: existingUser.id,
                username: existingUser.username,
                isSubscribed: existingUser.isSubscribed,
              });
            }
            
            // Create a new user
            const newUser: InsertUser = {
              username: profile.displayName || `user-${profile.id}`,
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
              profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            };
            
            const createdUser = await storage.createUser(newUser);
            
            return done(null, {
              id: createdUser.id,
              username: createdUser.username,
              isSubscribed: createdUser.isSubscribed,
            });
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Auth routes
  const router = express.Router();

  router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ id: user.id, username: user.username, isSubscribed: user.isSubscribed });
      });
    })(req, res, next);
  });

  router.post("/signup", async (req, res, next) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user
      const user = await storage.createUser({ username, password, email });
      
      // Log user in
      req.login(
        { id: user.id, username: user.username, isSubscribed: user.isSubscribed },
        (err) => {
          if (err) {
            return next(err);
          }
          return res.status(201).json({
            id: user.id,
            username: user.username,
            isSubscribed: user.isSubscribed,
          });
        }
      );
    } catch (err) {
      next(err);
    }
  });

  router.get("/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json(req.user);
  });

  router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect("/landing");
    });
  });

  // Google OAuth routes
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.use("/api/auth", router);
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is subscribed
export function isSubscribed(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.isSubscribed) {
    return next();
  }
  res.status(403).json({ message: "Subscription required" });
}
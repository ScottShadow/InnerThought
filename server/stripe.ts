import { Request, Response, Router } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";

// Initialize Stripe
const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function setupStripeRoutes(app: Router) {
  // Check if Stripe is configured
  if (!stripeClient) {
    console.warn("Stripe secret key is not configured. Subscription features will not work.");
    return;
  }

  // Create Stripe checkout session for one-time payment
  app.post("/create-checkout", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Create a Stripe customer if the user doesn't have one
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeClient.customers.create({
          email: user.email || undefined,
          name: user.displayName || user.username,
          metadata: {
            userId: user.id.toString(),
          },
        });

        // Store the customer ID
        customerId = customer.id;
        // Update user with Stripe customer ID
        await storage.updateUserStripeCustomerId(user.id, customerId);
      }

      // Create a checkout session for one-time payment
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "MindJournal Premium",
                description: "Lifetime access to premium features",
              },
              unit_amount: 300, // $3.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/subscription-success`,
        cancel_url: `${req.protocol}://${req.get("host")}/subscribe`,
        customer: customerId,
        metadata: {
          userId: req.user.id.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Webhook endpoint to handle successful payments
  app.post("/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }

    let event;
    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).json({ message: "Webhook signature verification failed" });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update user subscription status
      if (session.metadata?.userId) {
        const userId = parseInt(session.metadata.userId);
        if (!isNaN(userId)) {
          try {
            // Set subscription to never expire (lifetime access)
            await storage.updateUserSubscription(userId, true);
            console.log(`User ${userId} subscription activated`);
          } catch (error) {
            console.error("Failed to update user subscription:", error);
          }
        }
      }
    }

    res.json({ received: true });
  });

  // Check subscription status
  app.get("/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
      });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  return app;
}
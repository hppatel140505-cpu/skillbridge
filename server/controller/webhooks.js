// controller/webhooks.js
import { Webhook } from "svix";
import User from "../model/User.js";
import "dotenv/config.js";
import Stripe from "stripe";
import { Purchase } from "../model/Purchase.js";
import Course from "../model/Course.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===================== CLERK WEBHOOK ===================== //
export const clerWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          enrolledCourses: [],
        };
        await User.create(userData);
        res.json({});
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        res.json({});
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===================== STRIPE WEBHOOK ===================== //
// ===================== STRIPE WEBHOOK ===================== //
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Stripe requires rawBody, not parsed JSON
    event = stripe.webhooks.constructEvent(
      req.body, // if you used express.raw()
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { purchaseId, userId, courseId } = session.metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) break;
        if (purchaseData.status === "completed") break; // idempotent

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (userData && courseData) {
          if (!userData.enrolledCourses.includes(courseId)) {
            userData.enrolledCourses.push(courseId);
            await userData.save();
          }
          if (!courseData.enrolledStudents.includes(userId)) {
            courseData.enrolledStudents.push(userId);
            await courseData.save();
          }
        }

        purchaseData.status = "completed";
        await purchaseData.save();
        console.log("✅ Payment success DB updated");
        break;
      }

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        const session = event.data.object;
        const { purchaseId } = session.metadata || {};
        if (purchaseId) {
          await Purchase.findByIdAndUpdate(purchaseId, { status: "failed" });
        }
        console.log("❌ Payment failed DB updated");
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error.message);
    res.status(500).json({ error: error.message });
  }
};

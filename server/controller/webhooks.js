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
      case "user.created":
        await User.create({
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          enrolledCourses: [],
        });
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        });
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log(`⚠️ Unhandled Clerk event type: ${type}`);
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== STRIPE WEBHOOK ===================== //
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("👉 Stripe Webhook called");

  try {
    // rawBody must be used
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified");
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("👉 Event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "payment_intent.succeeded": {
        const session = event.data.object;
        console.log("👉 Payment Succeeded Event:", session);

        const { purchaseId, userId, courseId } = session.metadata || {};
        if (!purchaseId || !userId || !courseId) {
          console.error("⚠️ Missing metadata in session!");
          break;
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error("❌ Purchase not found in DB");
          break;
        }

        if (purchaseData.status === "completed") {
          console.log("⚠️ Purchase already completed");
          break;
        }

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (userData && courseData) {
          if (!userData.enrolledCourses.includes(courseId)) {
            userData.enrolledCourses.push(courseId);
            await userData.save();
            console.log("✅ User enrolled in course");
          }

          if (!courseData.enrolledStudents.includes(userId)) {
            courseData.enrolledStudents.push(userId);
            await courseData.save();
            console.log("✅ Course updated with new student");
          }
        }

        purchaseData.status = "completed";
        await purchaseData.save();
        console.log("✅ Purchase marked as completed in DB");
        break;
      }

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        const session = event.data.object;
        const { purchaseId } = session.metadata || {};
        if (purchaseId) {
          await Purchase.findByIdAndUpdate(purchaseId, { status: "failed" });
          console.log(`❌ Purchase ${purchaseId} marked as failed`);
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Stripe webhook processing failed:", error);
    res.status(500).json({ error: error.message });
  }
};

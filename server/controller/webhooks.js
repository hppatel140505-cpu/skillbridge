import { Webhook } from "svix";
import User from "../model/User.js";
import "dotenv/config.js";
import Stripe from "stripe";
import { Purchase } from "../model/Purchase.js";
import Course from "../model/Course.js";

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
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ✅ PAYMENT SUCCESS
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        // Find checkout session linked to payment
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!sessionList.data.length) {
          return res.status(404).send("No session found");
        }

        const session = sessionList.data[0];
        const { purchaseId } = session.metadata;

        // Update purchase entry
        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          return res.status(404).send("Purchase not found");
        }

        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId);

        if (userData && courseData) {
          // add course to user
          if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
          }

          // add student to course
          if (!courseData.enrolledStudents.includes(userData._id)) {
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
          }
        }

        purchaseData.status = "completed";
        await purchaseData.save();

        break;
      }

      // ❌ PAYMENT FAILED
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!sessionList.data.length) {
          return res.status(404).send("No session found");
        }

        const session = sessionList.data[0];
        const { purchaseId } = session.metadata;

        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = "failed";
          await purchaseData.save();
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error.message);
    res.status(500).json({ error: error.message });
  }
};

import User from "../model/User.js"
import { Purchase } from "../model/Purchase.js"
import Stripe from "stripe"
import Course from "../model/Course.js"
import { courseProgress } from "../model/CourseProgress.js"
import { clerkClient } from "@clerk/express"
import { Webhook } from "svix"
import "dotenv/config.js"

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)


// ===================== USER DATA ===================== //
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "User Not Found" })
    }
    res.json({ success: true, user })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== USER ENROLLED COURSES ===================== //
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId
    let userData = await User.findById(userId).populate("enrolledCourses")

    if (!userData) {
      const clerkUser = await clerkClient.users.getUser(userId)
      userData = await User.create({
        _id: userId,
        name: clerkUser.firstName + " " + clerkUser.lastName,
        email: clerkUser.emailAddresses[0].emailAddress,
        imageUrl: clerkUser.imageUrl,
        enrolledCourses: []
      })
    }

    res.json({ success: true, enrolledCourses: userData.enrolledCourses })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== PURCHASE COURSE ===================== //
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const { origin } = req.headers
    const userId = req.auth.userId

    const userData = await User.findById(userId)
    const courseData = await Course.findById(courseId)

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" })
    }

    const amount = (
      courseData.coursePrice -
      (courseData.discount * courseData.coursePrice) / 100
    ).toFixed(2)

    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount,
      status: "pending"
    })

    const currency = process.env.CURRENCY?.toLowerCase() || "usd"

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: courseData.courseTitle },
            unit_amount: Math.floor(amount * 100), // cents/paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId,
        courseId: courseData._id.toString(),
      },
    })

    res.json({ success: true, session_url: session.url })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== UPDATE COURSE PROGRESS ===================== //
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId, lectureId } = req.body

    const progressData = await courseProgress.findOne({ userId, courseId })

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: "Lecture Already Completed" })
      }
      progressData.lectureCompleted.push(lectureId)
      await progressData.save()
    } else {
      await courseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId]
      })
    }

    res.json({ success: true, message: "Progress Updated" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== GET COURSE PROGRESS ===================== //
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId } = req.body
    const progressData = await courseProgress.findOne({ userId, courseId })
    res.json({ success: true, progressData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== ADD USER RATING ===================== //
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId
  const { courseId, rating } = req.body

  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid Details" })
  }
  try {
    const course = await Course.findById(courseId)
    if (!course) return res.json({ success: false, message: "Course not found" })

    const user = await User.findById(userId)
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "User has not purchased this course." })
    }

    const existingIndex = course.courseRatings.findIndex(r => r.userId === userId)
    if (existingIndex > -1) {
      course.courseRatings[existingIndex].rating = rating
    } else {
      course.courseRatings.push({ userId, rating })
    }
    await course.save()

    return res.json({ success: true, message: "Rating added" })
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}


// ===================== CLERK WEBHOOK ===================== //
export const clerWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    })

    const { data, type } = req.body
    switch (type) {
      case "user.created": {
        await User.create({
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
          enrolledCourses: [],
        })
        break
      }
      case "user.updated": {
        await User.findByIdAndUpdate(data.id, {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        })
        break
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id)
        break
      }
    }
    res.json({})
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// ===================== STRIPE WEBHOOK ===================== //
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // ✅ rawBody use karna hai, req.body nahi
    event = Stripe.webhooks.constructEvent(
      req.rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
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
        break;
      }

      case "checkout.session.async_payment_failed":
      case "payment_intent.payment_failed": {
        const session = event.data.object;
        const { purchaseId } = session.metadata || {};
        if (purchaseId) {
          await Purchase.findByIdAndUpdate(purchaseId, { status: "failed" });
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error.message);
    res.status(500).json({ error: error.message });
  }
};


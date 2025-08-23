import User from "../model/User.js"
import { Purchase } from "../model/Purchase.js"
import Stripe from "stripe"
import Course from "../model/Course.js"
import { courseProgress } from "../model/CourseProgress.js"
import { clerkClient } from "@clerk/express"


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

// User Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    let userData = await User.findById(userId).populate('enrolledCourses');

    // If user doesn't exist in database, create them
    if (!userData) {
      // Get user info from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Create new user in database
      userData = await User.create({
        _id: userId,
        name: clerkUser.firstName + ' ' + clerkUser.lastName,
        email: clerkUser.emailAddresses[0].emailAddress,
        imageUrl: clerkUser.imageUrl,
        enrolledCourses: []
      });
    }

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Purchase Course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: 'Data Not Found' });
    }

    const amount = (
      courseData.coursePrice -
      (courseData.discount * courseData.coursePrice) / 100
    ).toFixed(2);

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount,
    };

    const newPurchase = await Purchase.create(purchaseData);

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId, lectureId } = req.body

    const progressData = await courseProgress.findOne({ userId, courseId })

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: 'Lecture Already Completed' })
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

    res.json({ success: true, message: 'Progress Updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })

  }
}

// Get User Course Progress
export const getUserCourseProgress = async (res, req) => {
  try {
    const userId = req.auth.userId
    const { courseId, lectureId } = req.body
    const progressData = await courseProgress.findOne({ userId, courseId })
    res.json({success:true,progressData})

  } catch (error) {
    res.json({ success: false, message: error.message })

  }
}


// Add User Ratings to COurse

export const addUserRating = async (req,res)=>{
  const userId = req.auth.userId;
  const {courseId,rating}= req.body;

  if(!courseId || !userId || !rating || rating < 1 || rating > 5 ){
    return res.json({success: false , message: 'InValid Details'});
  }
  try {
    const course = await Course.findById(courseId);

    if(!course){
      return res.json({success:false,message:'Course not found'})
    }

    const user = await User.findById(userId);

    if(!user || user.enrolledCourses.includes(courseId)){
      return res.json({success:false,message:'User has not purchased this Course.'})
    }

    const existinRatingIndex = course.courseRatings.findIndex(r=>r.userId === userId)

    if(existinRatingIndex > -1){
      course.courseRatings[existinRatingIndex].rating = rating;

    }else{
      course.courseRatings.push({userId,rating});
    }
    await course.save();

    return res.json({success:true,message:'Rating added'});

  } catch (error) {
    return res.json({success:false,message:error.message});
    
  }
}
import { clerkClient } from '@clerk/express'
import Course from '../model/Course.js'
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from '../model/Purchase.js'
import User from '../model/User.js'


// update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',

            }
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add New Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.json({ success: true, message: 'course Added' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Get Educator Dashbord Data (Total Earning, Enrolled Students,No. of Courses)

export const educatorDashbordData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id)

        //Calculator total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'

        });

        const totalEarnings = purchases.reduce((sum, Purchase) => sum + Purchase.amount, 0);

        // Collect unique enrolled student Ids with their course titles
        // Collect unique enrolled student Ids with their course titles
        const enrolledStudentsData = [];

        for (const course of courses) {
            // 🔹 find returns an array, so name it "students"
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                "name imageUrl"
            );

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student,
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {   // ✅ fix spelling here
                totalEarnings,
                enrolledStudentsData,
                totalCourses,
            },
        });


    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Enrolled Student Data With Purchase Data
export const getEnrolledStudentData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// controller/educatorController.js
export const uploadLectureVideo = async (req, res) => {
  try {
    const videoFile = req.file;
    if (!videoFile) {
      return res.json({ success: false, message: "Video file not attached" });
    }

    // Cloudinary me video upload
    const uploadResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: "video",
      folder: "lectures",
    });

    res.json({
      success: true,
      message: "Lecture video uploaded successfully",
      videoUrl: uploadResult.secure_url,
      duration: uploadResult.duration, // optional
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addLectureToCourse = async (req, res) => {
  try {
    const { courseId, chapterId, lectureData } = req.body;
    // lectureData: { lectureId, lectureTitle, lectureUrl, isPreviewFree, lectureOrder, lectureDuration }

    const course = await Course.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) return res.json({ success: false, message: "Chapter not found" });

    chapter.chapterContent.push(lectureData);
    await course.save();

    res.json({ success: true, message: "Lecture added to course", lecture: lectureData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


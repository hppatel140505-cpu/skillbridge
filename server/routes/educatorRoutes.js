// import express from 'express'
// import { addCourse, educatorDashbordData, getEducatorCourses, getEnrolledStudentData, updateRoleToEducator } from '../controller/educatorController.js'
// import upload from '../configs/multer.js'
// import { protectEducator } from '../middlewares/authMiddleware.js'

// const educatorRouter=express.Router()

// // Add Educator Role
// educatorRouter.get('/update-role',updateRoleToEducator)
// educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)
// educatorRouter.get('/courses',protectEducator,getEducatorCourses)
// educatorRouter.get('/dashboard',protectEducator,educatorDashbordData)
// educatorRouter.get('/enrolled-students',protectEducator,getEnrolledStudentData)




// export default educatorRouter;

// routes/educatorRoutes.js
import express from 'express';
import {
  addCourse,
  educatorDashbordData,
  getEducatorCourses,
  getEnrolledStudentData,
  updateRoleToEducator,
  uploadLectureVideo,       // ✅ add this
  addLectureToCourse        // ✅ add this
} from '../controller/educatorController.js';

import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// ------------------
// Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator);

// ------------------
// Add New Course
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse);

// ------------------
// Get Educator Courses
educatorRouter.get('/courses', protectEducator, getEducatorCourses);

// ------------------
// Educator Dashboard
educatorRouter.get('/dashboard', protectEducator, educatorDashbordData);

// ------------------
// Get Enrolled Students
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentData);

// ------------------
// Upload Lecture Video
educatorRouter.post(
  '/upload-lecture-video',
  upload.single('video'),      // ✅ accept video file
  protectEducator,
  uploadLectureVideo
);

// ------------------
// Add Lecture to Course
educatorRouter.post(
  '/add-lecture',
  protectEducator,
  addLectureToCourse
);

export default educatorRouter;

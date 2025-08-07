import express from 'express'
import { getUserData, userEnrolledCourses } from '../controller/userController.js'

const userRouter = express.Router()

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses)

export default userRouter

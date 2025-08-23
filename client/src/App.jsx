import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/students/Home'
import CoursesList from './pages/students/CoursesList'
import CourseDetails from './pages/students/CourseDetails'
import MyEnrollment from './pages/students/MyEnrollments'
import Player from './pages/students/player'
import Loading from './components/students/Loading'
import Educator from './pages/educator/Educator'
import Dashbord from './pages/educator/Dashbord'
import AddCourse from './pages/educator/AddCourse'
import MYCourses from './pages/educator/MyCourses'
import StudentEnrolled from './pages/educator/StudentEnrolled'
import Navbar from './components/students/Navbar'
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';

const App = () => {

 const isEducatorRoute = useMatch('/educator/*')
  
  return (
    <div className='text-defult min-h-screen bg-white'>
    <ToastContainer/>
      {!isEducatorRoute &&  <Navbar/>}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/course-list" element={<CoursesList/>} />
        <Route path="/course-list/:input" element={<CoursesList/>} />
        <Route path="/course/:id" element={<CourseDetails/>} />
        <Route path="/my-enrollments" element={<MyEnrollment/>} />
        <Route path="/player/:courseId" element={<Player/>} />
        <Route path="/loading/:path" element={<Loading/>} />
        <Route path="/educator" element={<Educator/>}>
           <Route path="/educator" element={<Dashbord/>} />
           <Route path="add-course" element={<AddCourse/>} />
           <Route path="my-courses" element={<MYCourses/>} />
           <Route path="student-enrolled" element={<StudentEnrolled/>} />
        </Route>

      </Routes>
    </div>
  )
}

export default App

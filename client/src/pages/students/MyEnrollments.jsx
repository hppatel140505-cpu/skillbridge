import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {Line} from 'rc-progress'

const MyEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration,navigate } = useContext(AppContext);
  
  const [progressArray, setProgressArray] = useState([
    {lectureCompleted :2, totalLectures:4},
    {lectureCompleted :1, totalLectures:5},
    {lectureCompleted :3, totalLectures:6},
    {lectureCompleted :4, totalLectures:4},
    {lectureCompleted :0, totalLectures:3},
    {lectureCompleted :5, totalLectures:7},
    {lectureCompleted :6, totalLectures:8},
    {lectureCompleted :2, totalLectures:6},
    {lectureCompleted :4, totalLectures:10},
    {lectureCompleted :3, totalLectures:5},
    {lectureCompleted :7, totalLectures:7},
    {lectureCompleted :1, totalLectures:4},
    {lectureCompleted :0, totalLectures:2},
    {lectureCompleted :5, totalLectures:5},

  ])

  return (
    <div className="md:px-36 px-4 pt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📚 My Enrollments
      </h1>

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Completed</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {enrolledCourses.map((course, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-24 h-16 md:w-32 md:h-20 rounded-xl object-cover shadow-md"
                    />

                    <p className="font-semibold text-gray-800">
                      {course.courseTitle}
                    </p>
                    <Line strokeWidh={2} percent={progressArray[index] ? (progressArray[index].lectureCompleted*100)/
                      progressArray[index].totalLectures : 0 } className='bg-gray-300 rounded-full' />
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {calculateCourseDuration(course)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {progressArray[index] && `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures} `} <span>
                  Lectures</span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={()=>navigate(`/player/${course._id}`)} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-400 max-sm:text-xs text-white rounded-full">
                    {progressArray[index] && progressArray[index].lectureCompleted/progressArray[index].totalLectures == 1 ? 'completed' : 'On Going'}
                    
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyEnrollments;

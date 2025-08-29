import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import axios from "axios";
import { toast } from "react-toastify";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    fetchUserEnrolledCourses,
    userData,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      )
      setProgressArray(tempProgressArray)

    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(()=>{
    if(userData){
      fetchUserEnrolledCourses()
    }
  },[userData])

   useEffect(()=>{
    if(enrolledCourses.length>0){
      getCourseProgress()
    }
  },[enrolledCourses])

  // 🔑 required: re-fetch enrolled courses when this page loads
  // useEffect(() => {
  //   fetchUserEnrolledCourses();
  // }, []);

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
                    <Line
                      strokeWidth={2}
                      percent={
                        progressArray[index]
                          ? (progressArray[index].lectureCompleted * 100) /
                            progressArray[index].totalLectures
                          : 0
                      }
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {calculateCourseDuration(course)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {progressArray[index] &&
                    `${progressArray[index].lectureCompleted}/${progressArray[index].totalLectures}`}{" "}
                  <span>Lectures</span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/player/${course._id}`)}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-400 max-sm:text-xs text-white rounded-full"
                  >
                    {progressArray[index] &&
                    progressArray[index].lectureCompleted /
                      progressArray[index].totalLectures ==
                      1
                      ? "completed"
                      : "On Going"}
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

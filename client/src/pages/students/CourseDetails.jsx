import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/students/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import { toast } from "react-toastify";
import axios from "axios";

const CourseDetails = () => {
  const { id } = useParams();
  const {
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    currency,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);

  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn("Login to Enroll");
      }
      if (isAlreadyEnrolled) {
        return toast.warn("Already Enrolled");
      }

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrollCourse?.includes(courseData._id));
    }
  }, [userData, courseData]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const rating = courseData ? calculateRating(courseData) : 0;
  const reviewCount = courseData?.courseRatings?.length || 0;

  if (!courseData) return <Loading />;

  return (
    <div className="flex md:flex-row flex-col-reverse gap-14 relative items-start justify-between md:px-36 px-6 md:pt-28 pt-20 pb-16 text-left">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-[130vh] -z-10 bg-gradient-to-b from-cyan-100/70 to-transparent"></div>

      {/* Left section */}
      <div className="relative z-10 max-w-2xl text-gray-600">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
          {courseData.courseTitle}
        </h1>

        <p
          className="pt-4 text-sm md:text-base"
          dangerouslySetInnerHTML={{
            __html: courseData.courseDescription.slice(0, 200),
          }}
        />

        {/* Rating */}
        <div className="flex items-center gap-2 mt-4 mb-1 text-sm">
          <p className="font-medium">{rating.toFixed(1)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.round(rating) ? assets.star : assets.star_blank}
                alt="star"
                className="w-4 h-4"
              />
            ))}
          </div>
          <p className="text-blue-600">
            ({reviewCount} {reviewCount !== 1 ? "ratings" : "rating"})
          </p>
          <p>
            • {courseData.enrolledStudents.length}{" "}
            {courseData.enrolledStudents.length !== 1 ? "students" : "student"}
          </p>
        </div>

        <p className="text-sm">
          Course by <span className="text-blue-600 underline">Het Patel</span>
        </p>

        {/* Course Structure */}
        <div className="pt-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Course Structure
          </h2>
          {courseData.courseContent.map((chapter, index) => (
            <div
              key={index}
              className="border border-gray-300 bg-white mb-3 rounded"
            >
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={assets.down_arrow_icon}
                    alt="arrow"
                    className={`transition-transform w-4 ${
                      openSections[index] ? "rotate-180" : ""
                    }`}
                  />
                  <p className="font-medium text-sm md:text-base">
                    {chapter.chapterTitle}
                  </p>
                </div>
                <p className="text-sm md:text-base">
                  {chapter.chapterContent.length} lectures -{" "}
                  {calculateChapterTime(chapter)}
                </p>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openSections[index] ? "max-h-96" : "max-h-0"
                }`}
              >
                <ul className="border-t border-gray-300 py-2 px-5 text-sm text-gray-600 list-disc">
                  {chapter.chapterContent.map((lecture, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center py-1"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={assets.play_icon}
                          alt="play"
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className="text-gray-800">
                          {lecture.lectureTitle}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs md:text-sm text-gray-500">
                        {lecture.isPreviewFree && (
                          <span
                            onClick={() =>
                              setPlayerData({
                                videoId: lecture.lectureUrl.split("/").pop(),
                              })
                            }
                            className="text-blue-500 cursor-pointer"
                          >
                            Preview
                          </span>
                        )}
                        <span>
                          {humanizeDuration(lecture.lectureDuration * 60000, {
                            units: ["h", "m"],
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Course Description */}
        <div className="py-12">
          <h3 className="text-xl font-semibold text-gray-800">
            Course Description
          </h3>
          <p
            className="pt-3 text-sm md:text-base"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription,
            }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="w-full sm:w-[420px] rounded overflow-hidden shadow-[0_4px_15px_2px_rgba(0,0,0,0.1)] bg-white">
        {playerData ? (
          <YouTube
            videoId={playerData.videoId}
            opts={{ playerVars: { autoplay: 1 } }}
            iframeClassName="w-full aspect-video"
          />
        ) : (
          <img
            src={courseData.courseThumbnail}
            alt="Course Thumbnail"
            className="w-full h-56 object-cover rounded-t"
          />
        )}

        {/* Time left */}
        <div className="flex items-center gap-2 p-4 py-3 border-t">
          <img
            src={assets.time_left_clock_icon}
            alt="clock"
            className="w-4 h-4"
          />
          <p className="text-sm text-red-500">
            <span className="font-semibold">5 days</span> left at this price!
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-3 pt-1 px-4">
          <p className="text-2xl font-semibold text-gray-800">
            {currency}{" "}
            {(
              courseData.coursePrice -
              (courseData.discount * courseData.coursePrice) / 100
            ).toFixed(2)}
          </p>
          <p className="text-lg text-gray-500 line-through">
            {currency} {courseData.coursePrice}
          </p>
          <p className="text-lg text-gray-500">{courseData.discount}% off</p>
        </div>

        {/* Stats */}
        <div className="flex items-center text-sm gap-4 pt-3 pb-4 text-gray-500 px-4">
          <div className="flex items-center gap-1">
            <img src={assets.star} alt="star" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-1">
            <img src={assets.time_clock_icon} alt="clock" />
            <span>{calculateCourseDuration(courseData)}</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-1">
            <img src={assets.lesson_icon} alt="lessons" />
            <span>{calculateNoOfLectures(courseData)} lessons</span>
          </div>
        </div>

        {/* Enroll button */}
        <button
          onClick={enrollCourse}
          className="w-full py-3 bg-orange-400 text-white font-medium rounded-md hover:bg-orange-500 transition"
        >
          {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
        </button>

        {/* Course Features */}
        <div className="pt-6 pb-4">
          <p className="text-lg md:text-xl font-medium px-4 text-gray-800">
            What’s in the course?
          </p>
          <ul className="list-disc text-sm md:text-base text-gray-500 px-6 pt-2">
            <li>Lifetime access with free updates.</li>
            <li>Step-by-step, hands-on project guidance.</li>
            <li>Downloadable resources and source code.</li>
            <li>Quizzes to test your knowledge.</li>
            <li>Certificate of completion.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;

import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true); // ✅ Fixed typo
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // Calculate average rating
  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    const total = course.courseRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return total / course.courseRatings.length;
  };

  // Calculate total chapter time
  const calculateChapterTime = (chapter) => {
    const totalMinutes = chapter.chapterContent.reduce((sum, lec) => sum + lec.lectureDuration, 0);
    return humanizeDuration(totalMinutes * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate total course duration
  const calculateCourseDuration = (course) => {
    let total = 0;
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lec) => {
        total += lec.lectureDuration;
      });
    });
    return humanizeDuration(total * 60 * 1000, { units: ["h", "m"] });
  };

  // Count total lectures in a course
  const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce((count, chapter) => {
      return count + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0);
    }, 0);
  };

  // Fetch user's enrolled courses
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses); // simulate user enrolled courses
  };

  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses(); // ✅ Fixed: call fetch function
  }, []);

  const value = {
    currency,
    allCourses,
    enrolledCourses,
    navigate,
    isEducator,
    setIsEducator, 
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    fetchUserEnrolledCourses,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

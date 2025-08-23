import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  // Safe checks
  const rating = course ? calculateRating(course) : 0;
  const reviewCount = course?.courseRatings?.length || 0;

  return (
    <Link
      to={course?._id ? `/course/${course._id}` : "#"}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg"
    >
      {/* Thumbnail */}
      <img
        className="w-full"
        src={course?.courseThumbnail || assets.fallbackThumbnail}
        alt="Course Thumbnail"
      />

      <div className="p-3 text-left">
        {/* Title */}
        <h3 className="text-base font-semibold">
          {course?.courseTitle || "Untitled Course"}
        </h3>

        {/* Educator */}
        <p className="text-gray-500">
          {course?.educator?.name || "Unknown Educator"}
        </p>

        {/* Rating Row */}
        <div className="flex items-center space-x-2 my-2">
          <p className="font-medium">{rating.toFixed(1)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.round(rating) ? assets.star : assets.star_blank}
                alt="Star"
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <p className="text-gray-500 text-xs">({reviewCount})</p>
        </div>

        {/* Price */}
        <p className="text-base font-semibold text-gray-800">
          {currency}
          {course
            ? (
                course.coursePrice -
                (course.discount * course.coursePrice) / 100
              ).toFixed(2)
            : "0.00"}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;

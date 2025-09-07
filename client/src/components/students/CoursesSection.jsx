import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import CourseCard from "./CourseCard";
import { motion as Motion } from "framer-motion"; // ✅ alias

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className="py-16 md:px-40 px-8">
      {/* Heading */}
      <Motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl font-medium text-gray-800"
      >
        Learn from the best
      </Motion.h2>

      {/* Subtext */}
      <Motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-sm md:text-base text-gray-500 mt-3"
      >
        Discover our top-rated courses across various categories. From coding
        and design to <br /> business and wellness, our courses are crafted to
        deliver results.
      </Motion.p>

      {/* Courses Grid */}
      <Motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
        className="grid grid-cols-auto lg:grid-cols-4 px-4 md:px-0 md:my-16 my-10 gap-6"
      >
        {allCourses.slice(0, 4).map((course, index) => (
          <Motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="border border-gray-300 rounded-xl shadow-sm hover:shadow-lg hover:border-orange-400 bg-white p-3 transition duration-300"
          >
            <CourseCard course={course} />
          </Motion.div>
        ))}
      </Motion.div>

      {/* Show all courses button */}
      <Motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Link
          to="/course-list"
          onClick={() => window.scrollTo(0, 0)}
          className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded inline-block mt-2 hover:bg-gray-100 transition"
        >
          Show all courses
        </Link>
      </Motion.div>
    </div>
  );
};

export default CoursesSection;

import React from "react";
import { motion as Motion } from "framer-motion"; // ✅ alias use kiya
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-cyan-100/60 to-white px-6 text-center">
      {/* Main Heading */}
      <Motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-[32px] md:text-[56px] font-bold text-gray-800 leading-tight max-w-4xl relative text-center mx-auto"
      >
        Empower your future with the <br className="hidden md:block" />
        courses designed to{" "}
        <span className="relative inline-block text-orange-400">
          fit your choice.
          <Motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              delay: 1,
            }}
            src={assets.sketch}
            alt="underline"
            className="absolute -bottom-1 left-6 w-[110px] md:w-[160px] pointer-events-none select-none"
          />
        </span>
      </Motion.h1>

      {/* Subtext */}
      <Motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-gray-500 mt-6 max-w-2xl text-base md:text-lg leading-relaxed"
      >
        We bring together world-class instructors, interactive content, and a
        supportive community to help you achieve your personal and professional
        goals.
      </Motion.p>

      {/* Search Bar */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-10 w-full max-w-xl"
      >
        <SearchBar />
      </Motion.div>
    </div>
  );
};

export default Hero;

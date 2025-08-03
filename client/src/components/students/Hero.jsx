import React from "react";
import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-cyan-100/60 to-white px-6 text-center">
      {/* Main Heading */}
      <h1 className="text-[32px] md:text-[56px] font-bold text-gray-800 leading-tight max-w-4xl relative text-center mx-auto">
        Empower your future with the <br className="hidden md:block" />
        courses designed to{" "}
        <span className="relative inline-block text-orange-400">
          fit your choice.
          <img
            src={assets.sketch}
            alt="underline"
            className="absolute -bottom-1 left-6 w-[110px] md:w-[160px] pointer-events-none select-none"
          />
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-gray-500 mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
        We bring together world-class instructors, interactive content, and a
        supportive community to help you achieve your personal and professional
        goals.
      </p>

      {/* Search Bar */}
      <div className="mt-10 w-full max-w-xl">
        <SearchBar />
      </div>
    </div>
  );
};

export default Hero;

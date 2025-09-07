import React from "react";
import { assets } from "../../assets/assets";
import { motion as Motion } from "framer-motion"; // ✅ alias

function CallToAction() {
  return (
    <div className="flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0">
      {/* Heading */}
      <Motion.h1
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-xl md:text-4xl text-gray-800 font-semibold text-center"
      >
        Learn anything, anytime, anywhere
      </Motion.h1>

      {/* Subtext */}
      <Motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-gray-500 sm:text-sm text-center max-w-2xl"
      >
        Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id
        veniam aliqua provident excepteur commodo do eat.
      </Motion.p>

      {/* Buttons */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="flex items-center font-medium gap-6 mt-4"
      >
        {/* Primary Button */}
        <Motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="px-10 py-3 rounded-md text-white bg-orange-400 shadow-md hover:shadow-lg"
        >
          Get Started
        </Motion.button>

        {/* Secondary Button */}
        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-700 hover:text-orange-400 transition"
        >
          Learn More <img src={assets.arrow_icon} alt="arrow" />
        </Motion.button>
      </Motion.div>
    </div>
  );
}

export default CallToAction;

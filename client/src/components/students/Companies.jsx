import React from "react";
import { motion as Motion } from "framer-motion"; // ✅ alias use kiya
import { assets } from "../../assets/assets";

const Companies = () => {
  const logos = [
    assets.microsoft_logo,
    assets.walmart_logo,
    assets.accenture_logo,
    assets.adobe_logo,
    assets.paypal_logo,
  ];

  return (
    <div className="bg-white pt-1 pb-15 text-center">
      <p className="text-gray-500 text-sm md:text-base font-medium">
        Upskill here, succeed anywhere
      </p>

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
        className="mt-5 md:mt-10 flex flex-wrap justify-center items-center gap-6 md:gap-16"
      >
        {logos.map((logo, i) => (
          <Motion.img
            key={i}
            src={logo}
            alt="Company logo"
            className="w-20 md:w-28 object-contain"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.1 }}
          />
        ))}
      </Motion.div>
    </div>
  );
};

export default Companies;

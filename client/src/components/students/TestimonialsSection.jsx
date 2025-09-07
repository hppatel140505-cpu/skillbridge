import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";
import { motion as Motion } from "framer-motion"; // ✅ alias

const TestimonialsSection = () => {
  return (
    <div className="pb-14 px-8 md:px-0">
      {/* Heading */}
      <Motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl font-medium text-gray-800"
      >
        Testimonials
      </Motion.h2>

      {/* Subtext */}
      <Motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="md:text-base text-gray-500 mt-3"
      >
        Hear from our learners as they share their journeys of transformation,
        success, and how our <br /> platform has made a difference in their
        lives.
      </Motion.p>

      {/* Testimonial Cards */}
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
        className="grid grid-cols-auto lg:grid-cols-3 px-20 gap-8 mt-4"
      >
        {dummyTestimonial.map((testimonial, index) => (
          <Motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
            }}
            transition={{ duration: 0.4 }}
            className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden"
          >
            {/* User Info */}
            <div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10">
              <img
                className="h-12 w-12 rounded-full"
                src={testimonial.image}
                alt={testimonial.name}
              />
              <div>
                <h1 className="text-lg font-medium text-gray-800">
                  {testimonial.name}
                </h1>
                <p className="text-gray-800/80">{testimonial.role}</p>
              </div>
            </div>

            {/* Rating + Feedback */}
            <div className="p-5 pb-7">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <img
                    className="h-5"
                    key={i}
                    src={
                      i < Math.floor(testimonial.rating)
                        ? assets.star
                        : assets.star_blank
                    }
                    alt="star"
                  />
                ))}
              </div>
              <p className="text-gray-500 mt-5">{testimonial.feedback}</p>
            </div>

            {/* Read more */}
            <a href="#" className="text-blue-500 underline px-5">
              Read more
            </a>
          </Motion.div>
        ))}
      </Motion.div>
    </div>
  );
};

export default TestimonialsSection;

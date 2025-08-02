import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand / Logo */}
          <div className="text-xl font-semibold tracking-wide text-white">
            SkillBridge
          </div>

          {/* Developer Names - now in one line */}
          <div className="text-sm text-gray-400 flex flex-wrap items-center justify-center md:justify-start gap-x-1">
            <span>Developed with ❤️ by</span>
            <span className="text-white whitespace-nowrap">Het P. Patel,</span>
            <span className="text-white whitespace-nowrap">Het R. Patel,</span>
            <span className="text-white whitespace-nowrap">Shivam P. Goswami,</span>
            <span className="text-white whitespace-nowrap">Brig D. Patel</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} SkillBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  return (
    <div className="bg-white pt-1 pb-15 text-center">
      <p className="text-gray-500 text-sm md:text-base font-medium">
        Upskill here, succeed anywhere
      </p>

      <div className="mt-5 md:mt-10 flex flex-wrap justify-center items-center gap-6 md:gap-16">
        <img src={assets.microsoft_logo} alt="Microsoft" className="w-20 md:w-28 object-contain" />
        <img src={assets.walmart_logo} alt="Walmart" className="w-20 md:w-28 object-contain" />
        <img src={assets.accenture_logo} alt="Accenture" className="w-20 md:w-28 object-contain" />
        <img src={assets.adobe_logo} alt="Adobe" className="w-20 md:w-28 object-contain" />
        <img src={assets.paypal_logo} alt="PayPal" className="w-20 md:w-28 object-contain" />
      </div>
    </div>
  )
}

export default Companies

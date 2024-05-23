import React, { useState, useEffect } from 'react'
import Button from '../../components/UI/Button'
import { Link } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = ['/phone-1.png', '/phone-2.png', '/phone-3.png', '/phone-4.png']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // Change the interval time as needed
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="bg-gray-100">
      {/* First Section */}
      <section className="flex min-h-screen flex-col items-center justify-between bg-white px-6 py-8 md:flex-row">
        <div className="flex flex-1 flex-col justify-center text-center md:text-left">
          <div className="mx-auto max-w-xl px-6">
            <h1 className="text-4xl font-bold leading-tight text-black">FinSavvy: Empowering Your Financial Journey</h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Discover the power of financial mastery with FinSavvy – the ultimate companion for conquering your financial goals. Streamline
              your finances, gain valuable insights, and take control of your money like never before.
            </p>
            <Link to="/login">
              <Button style={{ padding: '16px 32px 16px', fontSize: '13px' }} className="mt-8">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-10 flex h-full flex-1 items-center justify-center md:mt-0">
          <img
            src={images[currentImageIndex]}
            alt="FinSavvy App - Empowering Financial Management"
            className="h-full w-10/12 object-cover md:w-5/12"
          />
        </div>
      </section>
    </div>
  )
}

export default LandingPage

import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 🌆 Images for the slider
const sliderImages = [
  { src: "/assets/images/slider1.jpg", caption: "Empowering Local Causes" },
  { src: "/assets/images/slider2.jpg", caption: "Small Donations, Big Impact" },
  { src: "/assets/images/slider3.jpg", caption: "Building Trust in Communities" },
  { src: "/assets/images/slider4.jpg", caption: "Helping Hands, Happier Lives" },
  { src: "/assets/images/slider5.jpg", caption: "Together We Make Change" },
];

const ImageSlider = () => {
  const settings = {
    dots: true,             // 🔹 Show navigation dots
    infinite: true,         // 🔹 Loop slides continuously
    speed: 600,             // 🔹 Slide transition speed (ms)
    slidesToShow: 1,        // 🔹 Show 1 slide at a time
    slidesToScroll: 1,
    autoplay: true,         // 🔹 Enable automatic sliding
    autoplaySpeed: 2500,    // 🔹 2.5s between slides
    arrows: false,          // 🔹 Hide next/prev arrows
    pauseOnHover: false,    // 🔹 Keep playing even when hovered
    cssEase: "ease-in-out", // 🔹 Smooth slide animation
    accessibility: false,   // 🔹 Disable aria-hidden warning
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      <Slider {...settings}>
        {sliderImages.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.src}
              alt={image.caption}
              className="w-full h-[500px] object-cover opacity-80"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/30">
              <h2 className="text-4xl font-bold mb-3">{image.caption}</h2>
              <p className="text-gray-300 mb-6 text-lg">
                Join thousands supporting verified local causes
              </p>
              <Link
                to="/signup"
                onClick={() => window.scrollTo(0, 0)}
                className="px-6 py-3 bg-[#26bfef] text-white rounded-full hover:bg-[#0a6c8b] transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;

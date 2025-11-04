import React from "react";

import ImageSlider from "../components/ImageSlider";
import FeatureSection from "../components/FeatureSection";
import AboutSection from "../components/AboutSection";
import CallToAction from "../components/CallToAction";


const LandingPage = () => {
  return (
    <div className="bg-[#111827] text-white min-h-screen flex flex-col">
      
      <ImageSlider />
      <FeatureSection />
      <AboutSection />
      <CallToAction />
      
    </div>
  );
};

export default LandingPage;

import React from 'react';
import HeroSection from '../components/HeroSection';
import Category from '../components/Category';
import Features from '../components/Feature';
import NewArrival from '../components/NewArrival';
import Banner from '../components/Banner';
import HomeCategory from '../components/HomeCategory';
import BrandCarousel from '../components/BrandCarousel';
import UnstitchedSection from '../components/UnstitchedSection.jsx';
import AccessoriesSection from '../components/AccessoriesSection.jsx';
import BestSeller from '../components/BestSeller.jsx';
import MostPopular from '../components/MostPopular.jsx';

import MidBanner from '../components/MidBanner.jsx';
import ColorCollection from '../components/ColorCollection.jsx';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <UnstitchedSection />
      <BestSeller />
      <HomeCategory />
      <ColorCollection />
      <AccessoriesSection />

      <NewArrival />
      <Banner />
      <MostPopular />

      <Features />
      <MidBanner />
      <BrandCarousel />
      <section className="newsletter-section">
        <p className="newsletter-text">
          Subscribe to our newsletter and get early access to new collections,
          discounts & more.
        </p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button onClick={() => alert('Thank you for subscribing!')}>
            SUBSCRIBE
          </button>
        </div>
      </section>
    </>
  );
}

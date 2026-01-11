import React, { useEffect, useRef, useState } from 'react';
import './HeroSection.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/slidee1.png', // Lawn Collection (your first banner)
      title: 'WINTER COLLECTION',
      subtitle: 'Unstitched Collection ’25',
      buttonText: 'Discover',
    },
    {
      id: 2,
      image: '/images/slidee2.png', // Winter Collection banner
      title: 'WINTER COLLECTION',
      subtitle: 'Embroidery Collection ’25',
      buttonText: 'Discover',
      link: '/winter',
    },
    {
      id: 3,
      image: '/images/slidee4.png', // Ready to Wear Collection

      link: '/readytowear',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentSlide + 1) % slides.length;
      scrollToSlide(next);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const scrollToSlide = (index) => {
    const width = sliderRef.current.offsetWidth;
    sliderRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });
    setCurrentSlide(index);
  };

  const handlePrev = () => {
    const prev = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    scrollToSlide(prev);
  };

  const handleNext = () => {
    const next = (currentSlide + 1) % slides.length;
    scrollToSlide(next);
  };

  return (
    <section className="hero-wrapper">
      <div className="hero-slider" ref={sliderRef}>
        {slides.map((slide) => (
          <div className="hero-slide" key={slide.id}>
            <img
              className="hero-banner-img"
              src={slide.image}
              alt={slide.title}
            />

            {/* Text overlay */}
            <div className="overlay-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className="hero-arrow left" onClick={handlePrev}>
        <ChevronLeft size={32} />
      </button>

      <button className="hero-arrow right" onClick={handleNext}>
        <ChevronRight size={32} />
      </button>
    </section>
  );
}

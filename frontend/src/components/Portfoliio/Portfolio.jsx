import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Portfolio.css';
import { assets } from '../../assets/assets';

const Portfolio = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { image: assets.image01, title: 'Beach Wedding' },
    { image: assets.image02, title: 'Sparkler Celebration' },
    { image: assets.image03, title: 'Intimate Moments' },
    { image: assets.image04, title: 'Family Love' },
    { image: assets.image05, title: 'Bridal Elegance' },
    { image: assets.image06, title: 'Sunset Romance' },
    { image: assets.image07, title: 'Vintage Charm' },
    { image: assets.image08, title: 'Candid Moments' }
  ];

  const visibleSlides = 4;

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      (prev + visibleSlides >= slides.length ? 0 : prev + visibleSlides)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      (prev - visibleSlides < 0 ? slides.length - (slides.length % visibleSlides || visibleSlides) : prev - visibleSlides)
    );
  };
 
  return (
    <div className="portfolio-container">
      <h2 className="portfolio-title">MY BEST CHOICES</h2>
     
      <div className="portfolio-gallery-wrapper">
        <button className="gallery-nav-button prev" onClick={prevSlide}>
          <ChevronLeft size={24} />
        </button>

        <div className="portfolio-gallery">
          {slides
            .slice(currentIndex, currentIndex + visibleSlides)
            .map((slide, index) => (
              <div key={`${currentIndex}-${index}`} className="portfolio-item">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="portfolio-image"
                />
                <div className="portfolio-item-title">{slide.title}</div>
              </div>
          ))}
        </div>

        <button className="gallery-nav-button next" onClick={nextSlide}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Portfolio;
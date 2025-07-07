import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';
import { StoreContext } from '../../context/StoreContext';

const Gallery = () => {
  const { albumId } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { url } = useContext(StoreContext);
  
  // Fetch images from the selected album
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/drive/${albumId}/images`);
        setImages(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again later.');
        setLoading(false);
      }
    };

    fetchImages();
  }, [albumId]);

  // Handle opening the lightbox
  const openLightbox = (index) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  };

  // Handle closing the lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Navigate through images in lightbox
  const navigateImage = useCallback((direction) => {
    if (selectedImage === null) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (selectedImage + 1) % images.length;
    } else {
      newIndex = (selectedImage - 1 + images.length) % images.length;
    }
    setSelectedImage(newIndex);
  }, [selectedImage, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage === null) return;
      
      switch (e.key) {
        case 'ArrowRight':
          navigateImage('next');
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'Escape':
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, navigateImage]);

  if (loading) {
    return (
      <div className="gallery-container loading">
        <div className="loader"></div>
        <p>Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <Link to="/album" className="back">
          <i className="fa fa-arrow-left"></i> Back to Albums
        </Link>
      </div>

      {images.length > 0 ? (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="gallery-item"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image.imageUrl} 
                alt={image.name}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="no-images">
          <p>No images found in this album.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="lightbox">
          <div className="lightbox-overlay" onClick={closeLightbox}></div>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button 
            className="lightbox-nav prev" 
            onClick={() => navigateImage('prev')}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          <div className="lightbox-content">
            <img 
              src={images[selectedImage].imageUrl} 
              alt={images[selectedImage].name} 
            />
            <div className="lightbox-caption">
              {images[selectedImage].name}
            </div>
          </div>
          <button 
            className="lightbox-nav next" 
            onClick={() => navigateImage('next')}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
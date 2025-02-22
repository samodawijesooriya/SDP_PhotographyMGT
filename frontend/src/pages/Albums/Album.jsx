import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './Album.css';
import { assets } from '../../assets/assets';
import Footer from '../../components/Footer/Footer';

const Album = () => {
  // All gallery items with their respective albums
  const allGalleryItems = [
    { id: 1, image: assets.image01, album: 'Bridal Collection' },
    { id: 2, image: assets.image02, album: 'Graduation' },
    { id: 3, image: assets.image03, album: 'Kids Photography' },
    { id: 4, image: assets.image04, album: 'Portrait' },
    { id: 5, image: assets.image05, album: 'Graduation' },
    { id: 6, image: assets.image06, album: 'Fashion' },
    { id: 7, image: assets.image07, album: 'Outdoor' },
    { id: 8, image: assets.image08, album: 'Casual' },
    { id: 9, image: assets.image09, album: 'Couple Shoot' }
  ];

  // Get the album name from URL params
  const { albumName } = useParams();

  // Filter images for the specific album
  const albumItems = allGalleryItems.filter(
    item => item.album.toLowerCase() === albumName.toLowerCase()
  );

  // State for selected image (for lightbox effect)
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to open lightbox
  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  // Function to close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div>
      <div className="album-container">
        <div className="header-section">
          <h1 className="main-title">{albumName} Album</h1>
          <div className="title-underline"></div>
        </div>
        
        <div className='album-container2'>
          <div className="album-grid">
            {albumItems.map((item) => (
              <div 
                key={item.id} 
                className="album-item" 
                onClick={() => openLightbox(item.image)}
              >
                <img
                  src={item.image}
                  alt={albumName}
                  className="album-image"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content">
            <img 
              src={selectedImage} 
              alt="Lightbox" 
              className="lightbox-image"
            />
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Album;
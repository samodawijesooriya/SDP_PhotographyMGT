import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Gallery.css';
import { assets } from '../../assets/assets';
import Footer from '../../components/Footer/Footer';

const Gallery = () => {
  const navigate = useNavigate();

  const galleryItems = [
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

  // Function to handle album navigation
  const handleAlbumClick = (albumName) => {
    // Convert album name to URL-friendly format
    const urlFriendlyAlbumName = albumName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/album/${urlFriendlyAlbumName}`);
  };

  return (
    <div>
    <div className="gallery-container">
      <div className="header-section">
          <h1 className="main-title">My Gallery</h1>
          <div className="title-underline"></div>
      </div>
      <div className='gallery-container2'>
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div 
            key={item.id} 
            className="gallery-item" 
            onClick={() => handleAlbumClick(item.album)}
          >
            <img
              src={item.image}
              alt={item.album}
              className="gallery-image"
            />
            <div className="gallery-overlay">
              <h3 className="album-title">{item.album}</h3>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Gallery;
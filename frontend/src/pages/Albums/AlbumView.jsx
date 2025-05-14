import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { useAuth } from '../../context/AuthContext';
import { googleDriveService } from '../../services/googleDriveService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AlbumView.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

const AlbumView = () => {
  const { albumId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const albumName = location.state?.albumName || 'Album';
  
  const { accessToken, isLoading, setIsLoading } = useAuth();
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchAlbumImages = async () => {
      if (!accessToken || !albumId) return;

      setIsLoading(true);
      try {
        const albumImages = await googleDriveService.fetchFolderImages(albumId, accessToken);
        
        const processedImages = albumImages.map(image => ({
          id: image.id,
          name: image.name,
          thumbnailUrl: image.thumbnailLink,
          fullUrl: googleDriveService.getImageUrl(image.id, accessToken)
        }));
        
        setImages(processedImages);
      } catch (err) {
        console.error('Error fetching album images:', err);
        setError('Failed to load album images. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchAlbumImages();
    }
  }, [albumId, accessToken, setIsLoading]);

  const openModal = (image) => {
    setSelectedImage(image);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (!accessToken) {
    navigate('/');
    return null;
  }

  return (
    <div className="album-view">
    <div className="album-view-container">
      <div className="album-header">
        <button className="back-button" onClick={handleGoBack}>
          &larr; Back
        </button>
        <h1 className="album-name">{albumName}</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="album-grid">
          {images.map((image) => (
            <div key={image.id} className="album-image-container" onClick={() => openModal(image)}>
              <img 
                src={image.thumbnailUrl || image.fullUrl} 
                alt={image.name}
                className="album-image"
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="image-modal"
        overlayClassName="modal-overlay"
      >
        {selectedImage && (
          <>
            <button className="modal-close-button" onClick={closeModal}>×</button>
            <img 
              src={selectedImage.fullUrl} 
              alt={selectedImage.name}
              className="modal-image"
            />
            <p className="modal-image-name">{selectedImage.name}</p>
          </>
        )}
      </Modal>
    </div>
    </div>
  );
};

export default AlbumView;
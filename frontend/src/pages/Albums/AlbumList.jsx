import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AlbumList.css';
import { StoreContext } from '../../context/StoreContext';

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [albumThumbnails, setAlbumThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url } = useContext(StoreContext);  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        console.log('Fetching albums from:', `${url}/api/drive`);
        const response = await axios.get(`${url}/api/drive`);
        console.log('Albums response:', response.data);
        setAlbums(response.data);
        
        // Fetch thumbnail for each album
        const thumbnails = {};
        for (const album of response.data) {
          try {            
            console.log(`Fetching thumbnail for album ${album.id} from: ${url}/api/drive/${album.id}/thumbnail`);
            const thumbnailResponse = await axios.get(`${url}/api/drive/${album.id}/thumbnail`);
            console.log(`Thumbnail response for album ${album.id}:`, thumbnailResponse.data);
            
            if (thumbnailResponse.data && thumbnailResponse.data.thumbnailUrl) {
              // Check if the thumbnailUrl is a relative path and convert to absolute URL if needed
              let thumbnailUrl = thumbnailResponse.data.thumbnailUrl;
              
              // Only process URLs that actually exist
              if (thumbnailUrl) {
                // If it's a Google Drive URL (starts with https://lh3.googleusercontent.com),
                // make sure we're using the correct format
                if (thumbnailUrl.includes('googleusercontent.com')) {
                  // Ensure we're using https and not using any parameters that might cause issues
                  const googleUrl = new URL(thumbnailUrl);
                  thumbnailUrl = googleUrl.toString();
                } 
                // If it's a relative path, make it absolute
                else if (!thumbnailUrl.startsWith('http')) {
                  thumbnailUrl = thumbnailUrl.startsWith('/') 
                    ? `${url}${thumbnailUrl}` 
                    : `${url}/${thumbnailUrl}`;
                }
                
                thumbnails[album.id] = thumbnailUrl;
                console.log(`Set thumbnail for album ${album.id}:`, thumbnailUrl);
              } else {
                console.log(`No valid thumbnail URL for album ${album.id}`);
              }
            }
          } catch (err) {
            console.error(`Error fetching thumbnail for album ${album.id}:`, err);
            // Continue even if one thumbnail fails
          }
        }
        setAlbumThumbnails(thumbnails);
        console.log('All album thumbnails:', thumbnails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError('Failed to load albums. Please try again later.');
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [url]);

  if (loading) {
    return (
      <div className="albums-container loading">
        <div className="loader"></div>
        <p>Loading albums...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="albums-container error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="albums-container">
      <h1>Photo Albums</h1>
      <div className="albums-grid">
        {albums.length > 0 ? (
          albums.map((album) => (            
            <Link to={`/gallery/${album.id}`} key={album.id} className="album-card">
            <div className="album-thumbnail">              {albumThumbnails[album.id] ? (
                <img 
                  src={albumThumbnails[album.id]} 
                  alt={album.name} 
                  className="album-thumbnail-img"
                  crossOrigin="anonymous" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error(`Failed to load thumbnail for album ${album.id}:`, e);
                    e.target.onerror = null;
                    
                    // Try with a proxy if it's a Google Drive URL
                    const src = e.target.src;
                    if (src.includes('googleusercontent.com') && !src.includes('proxy')) {
                      console.log(`Trying proxy for thumbnail ${album.id}`);
                      // If it's a Google URL, try to load via our own API
                      e.target.src = `${url}/api/drive/images/${album.id}`;
                      return;
                    }
                    
                    // Replace with fallback icon if proxy also fails
                    const parent = e.target.parentNode;
                    if (parent) {
                      // Remove the broken image
                      e.target.remove();
                      
                      // Add fallback icon
                      const iconDiv = document.createElement('div');
                      iconDiv.className = 'album-icon';
                      iconDiv.innerHTML = '<i class="fa fa-images"></i>';
                      parent.appendChild(iconDiv);
                    }
                  }}
                />
              ) : (
                <div className="album-icon">
                  <i className="fa fa-images"></i>
                </div>
              )}
            </div>
            <div className="album-info">
              <h3>{album.name}</h3>
              {album.description && <p>{album.description}</p>}
            </div>
          </Link>
          ))
        ) : (
          <div className="no-albums">
            <p>No albums found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumList;
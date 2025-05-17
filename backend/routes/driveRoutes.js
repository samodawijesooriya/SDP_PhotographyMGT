import { google } from 'googleapis';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';


const driveRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({
    version: 'v3',
    auth,
});

driveRouter.get('/', async (req, res) => {

    try {
        // Query for folders in the specified parent folder
        const rootFolderId = process.env.ROOT_FOLDER_ID;

        const response = await drive.files.list({
        q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, description)',
        });

        res.json(response.data.files);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

driveRouter.get('/:albumId/thumbnail', async (req, res) => {
  try {
    const { albumId } = req.params;
    
    // Query for the first image in the album to use as a thumbnail
    const response = await drive.files.list({
      q: `'${albumId}' in parents and (mimeType contains 'image/') and trashed=false`,
      fields: 'files(id, name, thumbnailLink)',
      orderBy: 'createdTime',
      pageSize: 1
    });
    
    if (response.data.files.length > 0) {
      const firstImage = response.data.files[0];
      
      // If using a Google thumbnailLink, validate it first
      if (firstImage.thumbnailLink) {
        // Return the direct thumbnail URL from Google Drive
        return res.json({
          thumbnailUrl: firstImage.thumbnailLink
        });
      }
      
      // Fallback to our own API endpoint - this ensures we can serve the image properly
      const imageUrl = `/api/drive/images/${firstImage.id}`;
      const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      
      res.json({
        thumbnailUrl: fullImageUrl 
      });
    } else {
      // No images in the album
      res.json({ thumbnailUrl: null });
    }
  } catch (error) {
    console.error(`Error fetching thumbnail for album ${req.params.albumId}:`, error);
    res.status(500).json({ error: 'Failed to fetch album thumbnail' });
  }
});

driveRouter.get('/:albumId/images', async (req, res) => {
    try {
    const { albumId } = req.params;
    
    const response = await drive.files.list({
      q: `'${albumId}' in parents and (mimeType contains 'image/') and trashed=false`,
      fields: 'files(id, name, thumbnailLink, webContentLink)',
      orderBy: 'name',
    });    // Process images to create direct access URLs
    const images = response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      // For direct image serving with absolute URLs
      imageUrl: `${req.protocol}://${req.get('host')}/api/drive/images/${file.id}`,
      thumbnailUrl: file.thumbnailLink || `${req.protocol}://${req.get('host')}/api/drive/thumbnails/${file.id}`
    }));

    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

driveRouter.get('/images/:imageId', async (req, res) => {
    try {
    const { imageId } = req.params;
    
    // Get file metadata to determine content type
    const fileMetadata = await drive.files.get({
      fileId: imageId,
      fields: 'mimeType'
    });
    
    // Set content type for the response
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
      // Get the file content
    const response = await drive.files.get({
      fileId: imageId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    // Add CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Pipe the file stream to the response
    response.data
      .on('error', error => {
        console.error('Error streaming file:', error);
        res.status(500).end();
      })
      .pipe(res);
        } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Endpoint to get a single image to use as a thumbnail
driveRouter.get('/images/:imageId/thumbnail', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: imageId,
      fields: 'mimeType,thumbnailLink'
    });
    
    // If Google Drive provides a thumbnailLink, redirect to it
    if (fileMetadata.data.thumbnailLink) {
      return res.redirect(fileMetadata.data.thumbnailLink);
    }
    
    // Otherwise, serve a resized version of the image
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    
    // Get the file with smaller size
    const response = await drive.files.get({
      fileId: imageId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    // Pipe the file to response
    response.data
      .on('error', error => {
        console.error('Error streaming thumbnail:', error);
        res.status(500).end();
      })
      .pipe(res);
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    res.status(500).json({ error: 'Failed to serve thumbnail' });
  }
});
    
export default driveRouter;
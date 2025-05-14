import axios from 'axios';

export const googleDriveService = {
  // Fetch root folders
  async fetchRootFolders(accessToken) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files', {
          params: {
            q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
            fields: 'files(id, name)',
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data.files;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  // Fetch thumbnail image from each folder (first image in the folder)
  async fetchFolderThumbnail(folderId, accessToken) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files', {
          params: {
            q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
            fields: 'files(id, name, thumbnailLink, webContentLink)',
            orderBy: 'createdTime',
            pageSize: 1
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data.files[0] || null;
    } catch (error) {
      console.error(`Error fetching thumbnail for folder ${folderId}:`, error);
      throw error;
    }
  },

  // Fetch all images from a specific folder
  async fetchFolderImages(folderId, accessToken) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files', {
          params: {
            q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
            fields: 'files(id, name, webContentLink, thumbnailLink)',
            orderBy: 'name',
            pageSize: 100
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data.files;
    } catch (error) {
      console.error(`Error fetching images for folder ${folderId}:`, error);
      throw error;
    }
  },

  // Get direct download URL for an image
  getImageUrl(fileId, accessToken) {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
  }
};
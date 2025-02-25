// routes/packageRoutes.js
import express, { Router } from 'express';
import { 
    getEvents,
    getPackageTiers, 
    getPackageItems,
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
    getPackageFormData} from '../controllers/packageController.js';


const packageRouter = express.Router();

// Get all packages
packageRouter.get('/', getAllPackages);

// fetch events
packageRouter.get('/events', getEvents);

// fetch package tiers
packageRouter.get('/tiers', getPackageTiers);

// fetch package items
packageRouter.get('/items', getPackageItems);   

// Get form data for package creation/editing
packageRouter.get('/form-data', getPackageFormData);

// Create a new package
packageRouter.post('/', createPackage);

// Update an existing package
packageRouter.put('/:packageId', updatePackage);

// Delete a package
packageRouter.delete('/:packageId', deletePackage);

export default packageRouter;
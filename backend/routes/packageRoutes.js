// routes/packageRoutes.js
import express, { Router } from 'express';
import { 
    getPackageDetails,
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

// fetch package details
packageRouter.get('/details', getPackageDetails);

// Create a new package
packageRouter.post('/create', createPackage);

// Update an existing package
packageRouter.put('/:packageId', updatePackage);

// Delete a package
packageRouter.delete('/:packageId', deletePackage);

export default packageRouter;
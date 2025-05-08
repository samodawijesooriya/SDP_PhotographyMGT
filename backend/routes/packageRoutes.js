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
    getPackageById,
    createPackageDetails,
    getPackageFormData,
    createPackageEvents,
    createPackageItems
} from '../controllers/packageController.js';


const packageRouter = express.Router();

// Get all packages
packageRouter.get('/', getAllPackages);

// get package by ID
packageRouter.get('/:packageId', getPackageById);

// fetch events
packageRouter.get('/pkg/events', getEvents);

// fetch package tiers
packageRouter.get('/pkg/tiers', getPackageTiers);

// fetch package items
packageRouter.get('/pkg/items', getPackageItems);   

// fetch package details
packageRouter.get('/pkg/details', getPackageDetails);

// Create a new package
packageRouter.post('/create', createPackage);

// Update an existing package
packageRouter.put('/:packageId', updatePackage);

// Delete a package
packageRouter.delete('/:packageId', deletePackage);

// add details to package
packageRouter.post('/pkg/details/create', createPackageDetails);

// add events to package
packageRouter.post('/pkg/events/create', createPackageEvents);

// add items to package
packageRouter.post('/pkg/items/create', createPackageItems);

export default packageRouter;
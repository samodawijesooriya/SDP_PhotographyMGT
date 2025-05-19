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
    createPackageItems,
    getPackageByEventType,
    createCustomPackage,
    getUserCustomPackages
} from '../controllers/packageController.js';


const packageRouter = express.Router();

// Get all packages
packageRouter.get('/', getAllPackages);

// get package by ID
packageRouter.get('/:packageId', getPackageById);

packageRouter.get('/base/:eventType', getPackageByEventType);

// fetch events
packageRouter.get('/pkg/events', getEvents);

// fetch package tiers
packageRouter.get('/pkg/tiers', getPackageTiers);

// fetch package items
packageRouter.get('/pkg/items', getPackageItems); 

packageRouter.post('/custom/create', createCustomPackage)

// get user custom package form data
packageRouter.get('/custom/get/:userId', getUserCustomPackages);

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
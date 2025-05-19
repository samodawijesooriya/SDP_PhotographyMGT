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
    createPackageEvents,
    createPackageItems,
    getPackageByEventType,
    createCustomPackage,
    getUserCustomPackages,
    createNewPackageDetails,
    deletePackageItems,
    deletePackageDetails,
    editPackageDetails,
    editPackageItems
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

// create package items
packageRouter.post('/items', createPackageItems);

// edit package items
packageRouter.get('/items/:itemId', getPackageItems);

// delete package items
packageRouter.delete('/items/:itemId', deletePackageItems);

// edit package items
packageRouter.put('/pkg/items/:itemId', editPackageItems);

// create a customized package
packageRouter.post('/custom/create', createCustomPackage)

// get user custom package form data
packageRouter.get('/custom/get/:userId', getUserCustomPackages);

// fetch package details
packageRouter.get('/pkg/details', getPackageDetails);

// create new pacakge details
packageRouter.post('/pkg/details', createNewPackageDetails);

// delete package details
packageRouter.delete('/details/:detailId', deletePackageDetails);

// edit package details
packageRouter.put('/pkg/details/:detailId', editPackageDetails);

// Create a new package
packageRouter.post('/create', createPackage);

// Update an existing package
packageRouter.put('/:packageId', updatePackage);

// Delete a package
packageRouter.delete('/:packageId', deletePackage);


export default packageRouter;
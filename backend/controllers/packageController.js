// controllers/packageController.js
import db from '../config/db.js';

// Get all packages with their details
const getAllPackages = async (req, res) => {
    try {
        const packagesQuery = `
            SELECT 
                p.packageId,
                p.packageName,
                e.eventName,
                pt.packageTierName,
                p.investedAmount,
                p.coverageHours,
                u.username AS username,
                GROUP_CONCAT(DISTINCT CONCAT(i.itemType, ':', pi.quantity) SEPARATOR '; ') AS items,
                GROUP_CONCAT(DISTINCT d.detailDescription SEPARATOR '; ') AS details
            FROM package p
            LEFT JOIN user u ON p.userId = u.userId
            LEFT JOIN event e ON p.eventId = e.eventId
            LEFT JOIN packageTier pt ON p.packageTierId = pt.packageTierId
            LEFT JOIN packageItems pi ON p.packageId = pi.packageId
            LEFT JOIN items i ON pi.itemId = i.itemId
            LEFT JOIN packageDetails pd ON p.packageId = pd.packageId
            LEFT JOIN details d ON pd.detailId = d.detailId
            GROUP BY 
                p.packageId, p.packageName, e.eventName, pt.packageTierName, 
                p.investedAmount, p.coverageHours, u.username;
        `;

        const [packages] = await db.promise().query(packagesQuery);
        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
};

const getPackageByEventType = async (req, res) => {
    try {
        const { eventType } = req.params;

        // get the eventId from the eventType
        const eventQuery = 'SELECT eventId FROM event WHERE eventName = ?';
        const eventResults = await db.promise().query(eventQuery, [eventType]);
        if (eventResults.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const [[eventResult]] = eventResults;
        const eventId = eventResult.eventId;

        // get the packages for the eventId and tierid is 6
        // Get the base package
        const packageQuery = `
            SELECT p.packageId, p.packageName, p.eventId, p.packageTierId, 
                   p.investedAmount, p.coverageHours, e.eventName,
                   pt.packageTierName
            FROM package p
            JOIN event e ON p.eventId = e.eventId
            JOIN packageTier pt ON p.packageTierId = pt.packageTierId
            WHERE p.eventId = ? AND p.packageTierId = 6
            LIMIT 1
        `;
        
        const [packageResult] = await db.promise().query(packageQuery, [eventId]);

        if (!packageResult || packageResult.length === 0) {
            return res.status(404).json({ message: "Base package not found for this event type" });
        }

        const basePackage = packageResult[0];

        // Get all items for this package
        const itemsQuery = `
            SELECT i.itemType, pi.quantity
            FROM packageItems pi
            JOIN items i ON pi.itemId = i.itemId
            WHERE pi.packageId = ?
        `;

        const [itemsResult] = await db.promise().query(itemsQuery, [basePackage.packageId]);

        // Format items as a string (itemType:quantity;itemType:quantity;...)
        const itemsString = itemsResult.map(item => 
            `${item.itemType}:${item.quantity}`
        ).join(';');

        // Get all details for this package
        const detailsQuery = `
            SELECT d.detailDescription
            FROM packageDetails pd
            JOIN details d ON pd.detailId = d.detailId
            WHERE pd.packageId = ?
        `;

        const [detailsResult] = await db.promise().query(detailsQuery, [basePackage.packageId]);

        // Format details as a string (detail1;detail2;detail3;...)
        const detailsString = detailsResult.map(detail => 
            detail.detailDescription
        ).join(';');

        // Combine all data
        const responseData = {
            packageId: basePackage.packageId,
            packageName: basePackage.packageName,
            eventId: basePackage.eventId,
            eventName: basePackage.eventName,
            packageTierId: basePackage.packageTierId,
            packageTierName: basePackage.packageTierName,
            investedAmount: basePackage.investedAmount,
            coverageHours: basePackage.coverageHours,
            items: itemsString,
            details: detailsString
        };

        res.json(responseData);
        
    } catch (error) {
        console.error('Error fetching base package:', error);
        res.status(500).json({ message: "Error fetching base package" });
    }
}

// Get package details by ID
const getPackageById = async (req, res) => {
    try {
        const { packageId } = req.params;
        
        const packageQuery = `
            SELECT p.packageId, p.packageName, e.eventName, pt.packageTierName, 
                   p.investedAmount, p.coverageHours,
                   GROUP_CONCAT(DISTINCT CONCAT(i.itemType, ':', pi.quantity) SEPARATOR '; ') AS items,
                   GROUP_CONCAT(DISTINCT d.detailDescription SEPARATOR '; ') AS details
            FROM package p
            LEFT JOIN event e ON p.eventId = e.eventId
            LEFT JOIN packageTier pt ON p.packageTierId = pt.packageTierId
            LEFT JOIN packageItems pi ON p.packageId = pi.packageId
            LEFT JOIN items i ON pi.itemId = i.itemId
            LEFT JOIN packageDetails pd ON p.packageId = pd.packageId
            LEFT JOIN details d ON pd.detailId = d.detailId
            WHERE p.packageId = ?
            GROUP BY p.packageId, p.packageName, e.eventName, pt.packageTierName, 
                     p.investedAmount, p.coverageHours
        `;

        const [packages] = await db.promise().query(packageQuery, [packageId]);
        
        if (packages.length === 0) {
            return res.status(404).json({ message: 'Package not fo' });
        }
        
        res.json(packages[0]);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ message: 'Error fetching package details', error: error.message });
    }
};


// Get all events
const getEvents = async (req, res) => {
    try {   
        const [events] = await db.promise().query('SELECT eventId, eventName FROM event');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error); 
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

// Get all package tiers
const getPackageTiers = async (req, res) => {
    try {
        const [tiers] = await db.promise().query('SELECT packageTierId, packageTierName FROM packageTier');
        res.json(tiers);
    } catch (error) {
        console.error('Error fetching package tiers:', error);
        res.status(500).json({ message: 'Error fetching package tiers', error: error.message });
    }
};

// Get all package items
const getPackageItems = async (req, res) => {  
    try {
        const [items] = await db.promise().query('SELECT itemId, itemType, pricePerItem FROM items');
        res.json(items);
    } catch (error) {
        console.error('Error fetching package items:', error);
        res.status(500).json({ message: 'Error fetching package items', error: error.message });
    }
};

// Get pacakge details
const getPackageDetails = async (req, res) => {
    try {
        const [details] = await db.promise().query('SELECT detailId, detailDescription, pricePerDetail FROM details');
        res.json(details);
    } catch (error) {
        console.error('Error fetching package details:', error);
        res.status(500).json({ message: 'Error fetching package details', error: error.message });
    }
};

// create new package details
const createPackageDetails = async (req, res) => {
    try {
        const { detailDescription } = req.body;
        const sqlInsert = 'INSERT INTO details (detailDescription) VALUES (?)';
        const insertResult = await queryDatabase(sqlInsert, [detailDescription]);

        if (insertResult.affectedRows > 0) {
            res.json({ success: true, message: 'Package detail created successfully', detailId: insertResult.insertId });
        }
        else {
            res.json({ success: false, message: 'Failed to create package detail' });
        }
    } catch (error) {
        console.error('Error creating package detail:', error);
        res.status(500).json({ message: 'Error creating package detail', error: error.message });
    }
}

const createPackageEvents = async (req, res) => {
    try {
        const { eventName, description} = req.body;
        const sqlInsert = 'INSERT INTO event (eventName, description) VALUES (?, ?)';
        const insertResult = await queryDatabase(sqlInsert, [eventName, description]);

        if (insertResult.affectedRows > 0) {
            res.json({ success: true, message: 'Package event created successfully', eventId: insertResult.insertId });
        }
        else {
            res.json({ success: false, message: 'Failed to create package event' });
        }
    } catch (error) {
        console.error('Error creating package event:', error);
        res.status(500).json({ message: 'Error creating package event', error: error.message });
    }
};

const createPackageItems = async (req, res) => {   
    try {
        const { itemType, itemDescription } = req.body;
        const sqlInsert = 'INSERT INTO items (itemType) VALUES ( ?)';
        const insertResult = await queryDatabase(sqlInsert, [itemType]);
        
        if (insertResult.affectedRows > 0) {
            res.json({ success: true, message: 'Package item created successfully', itemId: insertResult.insertId });
        }
        else {
            res.json({ success: false, message: 'Failed to create package item' });
        }   
    } catch (error) {
        console.error('Error creating package item:', error);
        res.status(500).json({ message: 'Error creating package item', error: error.message });
    }
};

const createPackage = async (req, res) => {
    const { 
        packageName, 
        coverageHours,
        eventName, 
        packageTier, 
        investedAmount, 
        items,
        details,
        userId,  // Add userId for custom packages
        isCustom  // Flag to identify custom packages
    } = req.body;

    try {
        // First, get the eventId from eventName
        const sqlEventQuery = 'SELECT eventId FROM event WHERE eventName = ?';
        const eventResults = await queryDatabase(sqlEventQuery, [eventName]);

        if (eventResults.length === 0) {
            return res.json({ success: false, message: "Event not found" });
        }
        const eventId = eventResults[0].eventId;

        // Then, get the packageTierId from packageTier
        const sqlTierQuery = 'SELECT packageTierId FROM packageTier WHERE packageTierName = ?';
        const tierResults = await queryDatabase(sqlTierQuery, [packageTier]);

        if (tierResults.length === 0) {
            return res.json({ success: false, message: "Package tier not found" });
        }
        const packageTierId = tierResults[0].packageTierId;

        // Generate new package ID if needed, or use auto-increment
        const sqlId = 'SELECT COALESCE(MAX(packageId), 0) AS maxId FROM package';
        const idResults = await queryDatabase(sqlId);
        const newPackageId = idResults[0].maxId + 1;

        // Insert the new package with userId for custom packages
        const sqlInsert = isCustom 
            ? 'INSERT INTO package (packageId, packageName, eventId, packageTierId, investedAmount, coverageHours, userId, isCustom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            : 'INSERT INTO package (packageId, packageName, eventId, packageTierId, investedAmount, coverageHours) VALUES (?, ?, ?, ?, ?, ?)';
        
        const insertParams = isCustom
            ? [newPackageId, packageName, eventId, packageTierId, investedAmount, coverageHours, userId, isCustom]
            : [newPackageId, packageName, eventId, packageTierId, investedAmount, coverageHours];
        await queryDatabase(sqlInsert, [newPackageId, packageName, eventId, packageTierId, investedAmount, coverageHours]);

        // Insert package items if they exist
        if (items && items.length > 0) {
            await Promise.all(items.map(item => {
                const sqlItemInsert = 'INSERT INTO packageItems (packageId, itemId, quantity) VALUES (?, ?, ?)';
                return queryDatabase(sqlItemInsert, [newPackageId, item.itemId, item.quantity]);
            }));
        }

        // Insert package details if they exist
        if (details && details.length > 0) {
            await Promise.all(details.map(detailId => {
                const sqlDetailInsert = 'INSERT INTO packageDetails (packageId, detailId) VALUES (?, ?)';
                return queryDatabase(sqlDetailInsert, [newPackageId, detailId]);
            }));
        }

        // Send success response after all inserts
        res.json({ success: true, message: 'Package created successfully', packageId: newPackageId });

    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Error creating package', error: error.message });
    }
};

// Utility function for querying the database with Promises
const queryDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const createCustomPackage = async (req, res) => {
    const { 
        packageName, 
        eventName, 
        packageTierName, 
        investedAmount, 
        items,         // Should be in format 'ItemType1:Quantity1;ItemType2:Quantity2'
        details,       // Should be in format 'Detail1;Detail2;Detail3'
        userId,        // Required for custom packages
    } = req.body;

    try {
        // Validate required fields
        if (!packageName || !eventName || !packageTierName || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields (packageName, eventName, packageTierName, userId)" 
            });
        }

        // First, get the eventId from eventName
        const sqlEventQuery = 'SELECT eventId FROM event WHERE eventName = ?';
        const eventResults = await queryDatabase(sqlEventQuery, [eventName]);

        if (eventResults.length === 0) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        const eventId = eventResults[0].eventId;

        // Then, get the packageTierId from packageTierName
        const sqlTierQuery = 'SELECT packageTierId FROM packageTier WHERE packageTierName = ?';
        const tierResults = await queryDatabase(sqlTierQuery, [packageTierName]);

        if (tierResults.length === 0) {
            return res.status(404).json({ success: false, message: "Package tier not found" });
        }
        const packageTierId = tierResults[0].packageTierId;

        // Generate new package ID
        const sqlId = 'SELECT COALESCE(MAX(packageId), 0) AS maxId FROM package';
        const idResults = await queryDatabase(sqlId);
        const newPackageId = idResults[0].maxId + 1;

        // Insert the new package with userId for custom packages
        const sqlInsert = 'INSERT INTO package (packageId, packageName, eventId, packageTierId, investedAmount, userId) VALUES (?, ?, ?, ?, ?, ?)';
        
        await queryDatabase(sqlInsert, [
            newPackageId, 
            packageName, 
            eventId, 
            packageTierId, 
            investedAmount, 
            userId,
        ]);

        // Process and insert items if they exist
        if (items && items.length > 0) {
            // Parse item string if needed
            const itemsArray = typeof items === 'string' 
                ? items.split(';').map(item => {
                    const [itemType, quantity] = item.split(':');
                    return { itemType, quantity: parseInt(quantity) || 1 };
                }) 
                : items;

            // For each item, get the itemId from itemType, then insert
            for (const item of itemsArray) {
                // Get itemId from itemType
                const sqlItemQuery = 'SELECT itemId FROM items WHERE itemType = ?';
                const itemResults = await queryDatabase(sqlItemQuery, [item.itemType]);
                
                if (itemResults.length > 0) {
                    const itemId = itemResults[0].itemId;
                    
                    // Insert into packageItem table
                    const sqlItemInsert = 'INSERT INTO packageItems (packageId, itemId, quantity) VALUES (?, ?, ?)';
                    await queryDatabase(sqlItemInsert, [newPackageId, itemId, item.quantity]);
                } else {
                    console.warn(`Item '${item.itemType}' not found in the database. Skipping.`);
                }
            }
        }

        // Process and insert details if they exist
        if (details && details.length > 0) {
            // Parse details string if needed
            const detailsArray = typeof details === 'string' 
                ? details.split(';').filter(detail => detail.trim() !== '')
                : details;

            // For each detail, get the detailId from detailDescription, then insert
            for (const detail of detailsArray) {
                // Get detailId from detailDescription
                const sqlDetailQuery = 'SELECT detailId FROM details WHERE detailDescription = ?';
                const detailResults = await queryDatabase(sqlDetailQuery, [detail]);
                
                if (detailResults.length > 0) {
                    const detailId = detailResults[0].detailId;
                    
                    // Insert into packageDetail table
                    const sqlDetailInsert = 'INSERT INTO packageDetails (packageId, detailId) VALUES (?, ?)';
                    await queryDatabase(sqlDetailInsert, [newPackageId, detailId]);
                } else {
                    console.warn(`Detail '${detail}' not found in the database. Skipping.`);
                }
            }
        }

        // Format the return data in the same structure as the original package data
        const formattedPackage = {
            packageId: newPackageId,
            packageName,
            eventName,
            packageTierName,
            investedAmount,
            items: items || '',
            details: details || '',
            userId,
            isCustom: true,
        };

        // Send success response after all inserts
        res.status(201).json({ 
            success: true, 
            message: 'Custom package created successfully', 
            package: formattedPackage 
        });

    } catch (error) {
        console.error('Error creating custom package:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating custom package', 
            error: error.message 
        });
    }
};

// Get the user's custom packages
const getUserCustomPackages = async (req, res) => {
    const userId = req.params.userId;
    
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    try {
        // Join with event and packageTier to get names rather than just IDs
        const sql = `
            SELECT p.*, e.eventName, pt.packageTierName 
            FROM package p
            JOIN event e ON p.eventId = e.eventId
            JOIN packageTier pt ON p.packageTierId = pt.packageTierId
            WHERE p.userId = ?
        `;
        
        const packages = await queryDatabase(sql, [userId]);
        
        // For each package, get its items and details
        for (const pkg of packages) {
            // Get package items
            const itemsSql = `
                SELECT i.itemType, pi.quantity 
                FROM packageItems pi
                JOIN items i ON pi.itemId = i.itemId
                WHERE pi.packageId = ?
            `;
            const items = await queryDatabase(itemsSql, [pkg.packageId]);
            
            // Format items as a string
            pkg.items = items
                .map(item => `${item.itemType}:${item.quantity}`)
                .join(';');
            
            // Get package details
            const detailsSql = `
                SELECT d.detailDescription 
                FROM packageDetails pd
                JOIN details d ON pd.detailId = d.detailId
                WHERE pd.packageId = ?
            `;
            const details = await queryDatabase(detailsSql, [pkg.packageId]);
            
            // Format details as a string
            pkg.details = details
                .map(detail => detail.detailDescription)
                .join(';');
        }
        
        res.json(packages);
        
    } catch (error) {
        console.error('Error fetching custom packages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching custom packages', 
            error: error.message 
        });
    }
};

const updatePackage = async (req, res) => {
    const { packageId } = req.params;
    const { 
        packageName, 
        coverageHours,
        eventName, 
        packageTier, 
        investedAmount, 
        items,
        details
    } = req.body;

    try {
        // First, get the eventId from eventName
        const sqlEventQuery = 'SELECT eventId FROM event WHERE eventName = ?';
        const eventResults = await queryDatabase(sqlEventQuery, [eventName]);

        if (eventResults.length === 0) {
            return res.json({ success: false, message: "Event not found" });
        }
        const eventId = eventResults[0].eventId;

        // Then, get the packageTierId from packageTier
        const sqlTierQuery = 'SELECT packageTierId FROM packageTier WHERE packageTierName = ?';
        const tierResults = await queryDatabase(sqlTierQuery, [packageTier]);

        if (tierResults.length === 0) {
            return res.json({ success: false, message: "Package tier not found" });
        }
        const packageTierId = tierResults[0].packageTierId;

        // Update package details
        const sqlUpdatePackage = 'UPDATE package SET packageName = ?, eventId = ?, packageTierId = ?, investedAmount = ?, coverageHours = ? WHERE packageId = ?';
        await queryDatabase(sqlUpdatePackage, [packageName, eventId, packageTierId, investedAmount, coverageHours, packageId]);

        // Delete existing package items
        const sqlDeleteItems = 'DELETE FROM packageItems WHERE packageId = ?';
        await queryDatabase(sqlDeleteItems, [packageId]);

        // Insert new package items if they exist
        if (items && items.length > 0) {
            await Promise.all(items.map(item => {
                const sqlItemInsert = 'INSERT INTO packageItems (packageId, itemId, quantity) VALUES (?, ?, ?)';
                return queryDatabase(sqlItemInsert, [packageId, item.itemId, item.quantity]);
            }));
        }

        // Delete existing package details
        const sqlDeleteDetails = 'DELETE FROM packageDetails WHERE packageId = ?';
        await queryDatabase(sqlDeleteDetails, [packageId]);

        // Insert new package details if they exist
        if (details && details.length > 0) {
            await Promise.all(details.map(detailId => {
                const sqlDetailInsert = 'INSERT INTO packageDetails (packageId, detailId) VALUES (?, ?)';
                return queryDatabase(sqlDetailInsert, [packageId, detailId]);
            }));
        }

        // Send success response
        res.json({ 
            success: true, 
            message: 'Package updated successfully', 
            packageId: packageId 
        });

    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating package', 
            error: error.message 
        });
    }
};

const deletePackage = async (req, res) => {
    const { packageId } = req.params;

    try {
        // First, verify the package exists
        const sqlCheckPackage = 'SELECT packageId FROM package WHERE packageId = ?';
        const packageResults = await queryDatabase(sqlCheckPackage, [packageId]);

        if (packageResults.length === 0) {
            return res.json({ success: false, message: "Package not fou" });
        }

        // Delete related entries in packageItems
        const sqlDeleteItems = 'DELETE FROM packageItems WHERE packageId = ?';
        await queryDatabase(sqlDeleteItems, [packageId]);

        // Delete related entries in packageDetails
        const sqlDeleteDetails = 'DELETE FROM packageDetails WHERE packageId = ?';
        await queryDatabase(sqlDeleteDetails, [packageId]);

        // Delete the package
        const sqlDeletePackage = 'DELETE FROM package WHERE packageId = ?';
        await queryDatabase(sqlDeletePackage, [packageId]);

        // Send success response
        res.json({ 
            success: true, 
            message: 'Package deleted successfully',
            packageId: packageId 
        });

    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting package', 
            error: error.message 
        });
    }
};

// Get additional data for package creation/editing
const getPackageFormData = async (req, res) => {
    try {
        const [events] = await db.promise().query('SELECT eventId, eventName FROM event');
        const [tiers] = await db.promise().query('SELECT packageTierId, packageTierName FROM packageTier');
        const [items] = await db.promise().query('SELECT itemId, itemType FROM items');
        const [details] = await db.promise().query('SELECT detailId, detailDescription FROM details');

        res.json({
            events,
            tiers,
            items,
            details
        });
    } catch (error) {
        console.error('Error fetching package form data:', error);
        res.status(500).json({ 
            message: 'Error fetching package form data', 
            error: error.message 
        });
    }
};

export {
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
    getPackageFormData,
    getEvents,
    getPackageTiers,
    getPackageItems,
    getPackageDetails,
    getPackageById,
    createPackageDetails,
    createPackageEvents, 
    createPackageItems,
    getPackageByEventType,   
    createCustomPackage, 
    getUserCustomPackages
};
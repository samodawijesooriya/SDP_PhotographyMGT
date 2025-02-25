// controllers/packageController.js
import db from '../config/db.js';

// Get all packages with their details
const getAllPackages = async (req, res) => {
    try {
        const packagesQuery = `
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
            GROUP BY p.packageId, p.packageName, e.eventName, pt.packageTierName, 
                     p.investedAmount, p.coverageHours
        `;

        const [packages] = await db.promise().query(packagesQuery);
        res.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
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
        const [items] = await db.promise().query('SELECT itemId, itemType FROM items');
        res.json(items);
    } catch (error) {
        console.error('Error fetching package items:', error);
        res.status(500).json({ message: 'Error fetching package items', error: error.message });
    }
};

// Create a new package
const createPackage = async (req, res) => {
    const { 
        packageName, 
        eventId, 
        packageTierId, 
        investedAmount, 
        coverageHours,
        items,
        details
    } = req.body;

    const connection = await db.promise().getConnection();

    try {
        // Start transaction
        await connection.beginTransaction();

        // Insert package
        const [packageResult] = await connection.query(
            'INSERT INTO package (packageName, eventId, packageTierId, investedAmount, coverageHours) VALUES (?, ?, ?, ?, ?)',
            [packageName, eventId, packageTierId, investedAmount, coverageHours]
        );
        const packageId = packageResult.insertId;

        // Insert package items
        if (items && items.length > 0) {
            const itemInsertPromises = items.map(item => 
                connection.query(
                    'INSERT INTO packageItems (packageId, itemId, quantity) VALUES (?, ?, ?)',
                    [packageId, item.itemId, item.quantity]
                )
            );
            await Promise.all(itemInsertPromises);
        }

        // Insert package details
        if (details && details.length > 0) {
            const detailInsertPromises = details.map(detailId => 
                connection.query(
                    'INSERT INTO packageDetails (packageId, detailId) VALUES (?, ?)',
                    [packageId, detailId]
                )
            );
            await Promise.all(detailInsertPromises);
        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({ 
            message: 'Package created successfully', 
            packageId: packageId 
        });
    } catch (error) {
        // Rollback transaction in case of error
        await connection.rollback();
        console.error('Error creating package:', error);
        res.status(500).json({ 
            message: 'Error creating package', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Update an existing package
const updatePackage = async (req, res) => {
    const { packageId } = req.params;
    const { 
        packageName, 
        eventId, 
        packageTierId, 
        investedAmount, 
        coverageHours,
        items,
        details
    } = req.body;

    const connection = await db.promise().getConnection();

    try {
        // Start transaction
        await connection.beginTransaction();

        // Update package details
        await connection.query(
            'UPDATE package SET packageName = ?, eventId = ?, packageTierId = ?, investedAmount = ?, coverageHours = ? WHERE packageId = ?',
            [packageName, eventId, packageTierId, investedAmount, coverageHours, packageId]
        );

        // Delete existing package items and details
        await connection.query('DELETE FROM packageItems WHERE packageId = ?', [packageId]);
        await connection.query('DELETE FROM packageDetails WHERE packageId = ?', [packageId]);

        // Insert new package items
        if (items && items.length > 0) {
            const itemInsertPromises = items.map(item => 
                connection.query(
                    'INSERT INTO packageItems (packageId, itemId, quantity) VALUES (?, ?, ?)',
                    [packageId, item.itemId, item.quantity]
                )
            );
            await Promise.all(itemInsertPromises);
        }

        // Insert new package details
        if (details && details.length > 0) {
            const detailInsertPromises = details.map(detailId => 
                connection.query(
                    'INSERT INTO packageDetails (packageId, detailId) VALUES (?, ?)',
                    [packageId, detailId]
                )
            );
            await Promise.all(detailInsertPromises);
        }

        // Commit transaction
        await connection.commit();

        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await connection.rollback();
        console.error('Error updating package:', error);
        res.status(500).json({ 
            message: 'Error updating package', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

// Delete a package
const deletePackage = async (req, res) => {
    const { packageId } = req.params;

    const connection = await db.promise().getConnection();

    try {
        // Start transaction
        await connection.beginTransaction();

        // Delete related entries in packageItems and packageDetails
        await connection.query('DELETE FROM packageItems WHERE packageId = ?', [packageId]);
        await connection.query('DELETE FROM packageDetails WHERE packageId = ?', [packageId]);

        // Delete the package
        const [result] = await connection.query('DELETE FROM package WHERE packageId = ?', [packageId]);

        // Commit transaction
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await connection.rollback();
        console.error('Error deleting package:', error);
        res.status(500).json({ 
            message: 'Error deleting package', 
            error: error.message 
        });
    } finally {
        connection.release();
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
};
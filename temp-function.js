// Calculate total investment based on selected items and details
const calculateTotalInvestment = () => {
    let total = 0;
    
    // Calculate price from selected items
    if (selectedItems && selectedItems.length > 0) {
        selectedItems.forEach(item => {
            const itemData = packageItems.find(i => i.itemId === item.itemId);
            if (itemData) {
                const itemPrice = parseFloat(itemData.pricePerItem) || 0;
                const itemTotal = itemPrice * item.quantity;
                total += itemTotal;
                console.log(`Item: ${itemData.itemType}, Qty: ${item.quantity}, Price: ${itemPrice}, Total: ${itemTotal}`);
            }
        });
    }
    
    // Add price for all details
    if (selectedDetails && selectedDetails.length > 0) {
        selectedDetails.forEach(detail => {
            const detailData = packageDetails.find(d => d.detailId === detail.detailId);
            if (detailData) {
                const detailPrice = parseFloat(detailData.pricePerDetail) || 0;
                total += detailPrice;
                console.log(`Detail: ${detailData.detailDescription}, Price: ${detailPrice}`);
            }
        });
    }
    
    console.log("Final calculated investment:", total);
    return total;
};

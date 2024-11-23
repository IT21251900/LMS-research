export const numberValidator = (value: any): boolean => {
    // Check if the value is defined and is a string or number
    if (value === undefined || value === null) {
        return false; // or handle it as you see fit
    }

    // Convert value to string if it's a number
    const strValue = value.toString();

    // Regular expression to match only positive integers
    const regex = /^\d+$/;

    return regex.test(strValue);
};

// Helper function to check if it's a valid ObjectId
export const isValidId = (id: any): boolean => {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

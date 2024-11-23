export const getExtension = (type) => {
    const files = {
        "image/jpg": ".jpg",
        "image/jpeg": ".jpeg",
        "image/png": ".png",
        "application/pdf": ".pdf",
    };
    return files[type];
};



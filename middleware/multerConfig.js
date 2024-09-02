const firebaseApp = require("firebase/app");
const firebaseStorage = require("firebase/storage");
const multer = require("multer");

firebaseApp.initializeApp({
    apiKey: "AIzaSyAY3t3oIqqUe4ABUW7VB8y_ZecSL4Zx5Zw",
    authDomain: "jogi-158d4.firebaseapp.com",
    projectId: "jogi-158d4",
    storageBucket: "jogi-158d4.appspot.com",
    messagingSenderId: "812376431144",
    appId: "1:812376431144:web:d99a3aa9ec036a9b9bb31d",
    measurementId: "G-9962SJ12GC"
});

const storage = firebaseStorage.getStorage();
const uploadMulter = multer({ storage: multer.memoryStorage() });

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}

const uploadImagesToFierbase = async (file) => {
    try {
        const dateTime = giveCurrentDateTime();
        const storageRef = firebaseStorage.ref(storage, `images/${file.originalname}-${dateTime}`);
        const metadata = {
            contentType: file.mimetype,
        };

        const snapshot = await firebaseStorage.uploadBytes(storageRef, file.buffer, metadata);
        const downloadURL = await firebaseStorage.getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading to Firebase Storage:", error);
        throw error;
    }
}

const deleteFileFromFirebase = async (fileName) => {
    try {
        const storageRef = firebaseStorage.ref(storage, fileName);
        await firebaseStorage.deleteObject(storageRef);
    } catch (error) {
        throw error;
    }
};

const getFileNameFromURL = (url) => {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/o/')[1];  // Get the path after '/o/'
    return decodeURIComponent(path.split('?')[0]);  // Decode URL and remove query params
};

module.exports = { uploadImagesToFierbase, uploadMulter, getFileNameFromURL, deleteFileFromFirebase };
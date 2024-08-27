"use strict";
const express = require("express");
const router = express();
const adminController = require("../controller/userController");
const path = require('path');

const FileUplaodToFirebase = require("../middleware/multerConfig");

// Admin
router
    .route("/register")
    .post(FileUplaodToFirebase.uploadMulter.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'certificate', maxCount: 1 },
        { name: 'nabh', maxCount: 1 }
    ]), adminController.registerUser)

router
    .route('/update/:userId')
    .put(FileUplaodToFirebase.uploadMulter.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'certificate', maxCount: 1 },
        { name: 'nabh', maxCount: 1 }
    ]), adminController.updateUser);

router
    .route('/delete/:userId')
    .delete(adminController.deleteUser);

router
    .route('/login')
    .post(adminController.loginUser);

router
    .route('/users/filter')
    .get(adminController.filterUsers);

router
    .route('/users/:userId')
    .get(adminController.getSingleUser);

router
    .route('/users')
    .get(adminController.getAllUsers);

router
    .route('/pending-users')
    .get(adminController.getAllPendingUsers);

router
    .route('/change-status/:userId')
    .post(adminController.changeUserStatus);

router
    .route('/forgotpassword')
    .post(adminController.forgotPassword);

router
    .route('/resetpassword/:resettoken')
    .post(adminController.updatePassword);

router.get('/reset-password/:resetToken', (req, res) => {
    res.sendFile(path.join(__dirname, '../reset-password.html'));
});

router
    .route('/images')
    .get(FileUplaodToFirebase.uploadMulter.single('file'), adminController.uploadFile)

module.exports = router;

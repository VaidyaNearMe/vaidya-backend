"use strict";
const express = require("express");
const router = express();
const specialityController = require("../controller/specialityController");

// Admin
router
    .route("/")
    .post(specialityController.createSpeciality);

router
    .route("/:id")
    .put(specialityController.updateSpeciality);

router
    .route("/:id")
    .delete(specialityController.deleteSpeciality);

router
    .route("/")
    .get(specialityController.getSpecialities);

module.exports = router;

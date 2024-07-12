"use strict";
const express = require("express");
const router = express();
const stateController = require("../controller/stateController");

// Admin
router
    .route("/")
    .post(stateController.createState)

router
    .route("/:id")
    .put(stateController.updateState);

router
    .route("/:id")
    .delete(stateController.deleteState);

router
    .route("/")
    .get(stateController.getStates);

module.exports = router;

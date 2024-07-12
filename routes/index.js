"use strict";
const express = require("express");
const router = express();

// :: Prefix Path ---  '/api'

const authRoutes = require("./auth");
const stateRoutes = require("./state");
const specialityRoutes = require("./speciality");
const updateRequestRoutes = require("./updateRequest");

router.use("/auth", authRoutes);
router.use("/state", stateRoutes);
router.use("/speciality", specialityRoutes);
router.use("/request", updateRequestRoutes);

module.exports = router;

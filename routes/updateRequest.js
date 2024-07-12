"use strict";
const express = require("express");
const router = express();
const { requestUpdateUser, approveUpdateRequest, getAllUpdateRequests, getPendingRequests } = require("../controller/updateRequestController");

router.get("/", getAllUpdateRequests);
router.route('/pending').get(getPendingRequests);
router.route('/:userId').post(requestUpdateUser);
router.route('/approve/:requestId').post(approveUpdateRequest);

module.exports = router;

const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const UpdateRequest = require("../models/updateRequestModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/SendEmail");

const requestUpdateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        const previousRequest = await UpdateRequest.find({user: userId});

        if(previousRequest?.length > 0){
            return res.status(StatusCodes.BAD_GATEWAY).json({
                status: StatusCodes.BAD_GATEWAY,
                success: false,
                message: "Your request alredy added",
            });
        }

        const updateRequest = new UpdateRequest({
            user: userId,
            updateData: updates
        });

        await updateRequest.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Update request created successfully",
            // updateRequest: updateRequest
        });
    } catch (error) {
        console.error("Error creating update request:", error);
        return next(new ErrorHandler("Failed to create update request", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const approveUpdateRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const updateRequest = await UpdateRequest.findById(requestId).populate('user');

        if (!updateRequest) {
            return next(new ErrorHandler("Update request not found", StatusCodes.NOT_FOUND));
        }

        if (status === "Approved") {
            const user = updateRequest.user;
            Object.keys(updateRequest.updateData).forEach((key) => {
                user[key] = updateRequest.updateData[key];
            });
            await user.save();
        }

        updateRequest.status = status;
        updateRequest.updatedAt = Date.now();

        await updateRequest.save();

        if (status !== "Approved") {
            await UpdateRequest.findByIdAndDelete(requestId); // delete the update request if status is not "Approved"
            const data = await ejs.renderFile(
                path.join(__dirname, "../views/rejected.ejs"), { user: user.name }
            );

            await sendEmail({
                email: user?.email,
                subject: `Your profile has been rejected.`,
                data: data
            });
        }else {
            const data = await ejs.renderFile(
                path.join(__dirname, "../views/approvregister.ejs"), { user: user.name }
            );
            await sendEmail({
                email: user?.email,
                subject: `Your profile has been successfully updated.`,
                data
            });
        }

        // try {
        //     await sendEmail({
        //         email: email,
        //         subject: `Approved your update request`,
        //         data: "Congratulations! Jogi ayurvaidya approve your update request."
        //     });
        // } catch (emailError) {
        //     console.error("Failed to send email:", emailError);
        //     return next(new ErrorHandler("Failed to send registration email", StatusCodes.INTERNAL_SERVER_ERROR));
        // }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Update request ${status.toLowerCase()} successfully`,
            updateRequest: updateRequest
        });
    } catch (error) {
        console.error("Error updating request status:", error);
        return next(new ErrorHandler("Failed to update request status", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllUpdateRequests = async (req, res, next) => {
    try {
        const updateRequests = await UpdateRequest.find().populate('user');

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "All update requests fetched successfully",
            updateRequests: updateRequests
        });
    } catch (error) {
        console.error("Error fetching update requests:", error);
        return next(new ErrorHandler("Failed to fetch update requests", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getPendingRequests = async (req, res, next) => {
    try {
        const updateRequests = await UpdateRequest.find({ status: "Pending" }).populate({ path : 'user', populate: {
            path: 'specialities',  // Populate the specialities field within user
            model: 'Specialities'
        }}).populate('updateData.speciality');

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "All pending requests fetched successfully",
            updateRequests: updateRequests
        });
    } catch (error) {
        console.error("Error fetching update requests:", error);
        return next(new ErrorHandler("Failed to fetch update requests", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    requestUpdateUser,
    approveUpdateRequest,
    getAllUpdateRequests,
    getPendingRequests
}
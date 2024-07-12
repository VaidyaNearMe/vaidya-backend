const ErrorHandler = require("../middleware/errorhander")
const State = require("../models/stateModel");
const { StatusCodes } = require("http-status-codes");

// create 

const createState = async (req, res, next) => {
    try {
        const { name, isoCode, countryCode } = req.body;

        const existingState = await State.findOne({ name });

        if (existingState) {
            return next(new ErrorHandler("State is already added", StatusCodes.BAD_REQUEST));
        }

        const state = new State({ name, isoCode, countryCode });

        await state.save();

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `State created successfully`,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return next(new ErrorHandler("Registration failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateState = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const state = await State.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
        if (!state) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: 'State not found' });
        }
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `State updated successfully`,
        });
    } catch (error) {
        console.error('Error updating state:', error);
        return next(new ErrorHandler("Error updating state", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteState = async (req, res, next) => {
    const { id } = req.params;

    try {
        const state = await State.findOneAndDelete({ _id: id });
        if (!state) {
            return res.status(HttpStatus.NOT_FOUND).json({ error: 'State not found' });
        }
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: 'State deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting state:', error);
        return next(new ErrorHandler("Error deleting state", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getStates = async (req, res, next) => {
    try {
        const states = await State.find();
        return res.status(StatusCodes.OK).json({
            success: true,
            states,
        });
    } catch (error) {
        console.error("Error fetching states:", error);
        return next(new ErrorHandler("Error fetching states", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    createState,
    updateState,
    deleteState,
    getStates
}
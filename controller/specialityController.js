const ErrorHandler = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const Speciality = require("../models/specialitiesModel");
const { StatusCodes } = require("http-status-codes");

// create 

const createSpeciality = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existingSpeciality = await Speciality.findOne({ name });

    if (existingSpeciality) {
      return next(new ErrorHandler("Speciality is already added", StatusCodes.BAD_REQUEST));
    }

    const speciality = new Speciality({ name });

    await speciality.save();

    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      success: true,
      message: `Speciality created successfully`,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return next(new ErrorHandler("Registration failed", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const updateSpeciality = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const speciality = await Speciality.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!speciality) {
      return res.status(404).json({ error: 'Speciality not found' });
    }
    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      success: true,
      message: `Speciality updated successfully`,
    })
  } catch (error) {
    console.error('Error updating speciality:', error);
    return next(new ErrorHandler("Error updating speciality", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const deleteSpeciality = async (req, res) => {
  const { id } = req.params;

  try {
    const speciality = await Speciality.findByIdAndDelete(id);
    if (!speciality) {
      return res.status(404).json({ error: 'Speciality not found' });
    }
    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      success: true,
      message: `Speciality deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting speciality:', error);
    return next(new ErrorHandler("Error deleting speciality", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const getSpecialities = async (req, res, next) => {
  try {
      const specialities = await Speciality.find();
      return res.status(StatusCodes.OK).json({
          success: true,
          specialities,
      });
  } catch (error) {
      console.error("Error fetching specialities:", error);
      return next(new ErrorHandler("Error fetching specialities", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
  getSpecialities
}
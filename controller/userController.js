const ErrorHandler = require("../middleware/errorhander");
const catchAsyncErrors = require("../errors/catchAsyncErrors");
const User = require("../models/userModel");
const { generateToken } = require("../utils/tokenGenerator");
const { StatusCodes } = require("http-status-codes");
const validator = require('validator');
const crypto = require('crypto');
const sendEmail = require("../utils/SendEmail")
const { uploadImagesToFierbase, deleteFileFromFirebase } = require("../middleware/multerConfig");
const ejs = require("ejs");
const path = require("path");
const { default: mongoose } = require("mongoose");
// create
const registerUser = async (req, res, next) => {
    try {
        const { email, specialities } = req.body;
        const body = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(new ErrorHandler("User Id is already in use", StatusCodes.BAD_REQUEST));
        }

        const files = req.files;

        // if (!files.avatar || !files.certificate || !files.nabh) {
        //     return next(new ErrorHandler("All images (avatar, certificate, nabh) are required", StatusCodes.BAD_REQUEST));
        // }

        let avatarUrl, certificateUrl, nabhUrl;

        if (files?.avatar) {
            avatarUrl = await uploadImagesToFierbase(files.avatar[0]);
        }
        if (files?.certificate) {
            certificateUrl = await uploadImagesToFierbase(files.certificate[0]);
        }
        if (files?.nabh) {
            nabhUrl = await uploadImagesToFierbase(files.nabh[0]);
        }

        // Convert specialities to an array of ObjectIds
        const specialitiesArray = specialities ? specialities.split(',').map(id => new mongoose.Types.ObjectId(id)) : [];

        const user = new User({
            ...body,
            specialities: specialitiesArray,
            avatar: avatarUrl ? avatarUrl : "",
            certificate: certificateUrl ? certificateUrl : "",
            nabh: nabhUrl ? nabhUrl : ""
        });

        await user.save();

        try {
            const resetPasswordUrl = `${process.env.FRONTEND_URL}/verify`
            const data = await ejs.renderFile(
                path.join(__dirname, "../views/register.ejs"), { user: user.name, restPass: resetPasswordUrl }
            );
            await sendEmail({
                email: email,
                subject: `Congratulations…. Your Registration is Being Processed`,
                data
            });
            console.log("Email sent on:", email);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            return next(new ErrorHandler("Failed to send registration email", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: `Registered successfully`,
            user
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return next(new ErrorHandler("Registration failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        const files = req.files;

        if (files) {
            if (files?.avatar) {
                if (user.avatar) {
                    await deleteFileFromFirebase(user.avatar);
                }
                user.avatar = await uploadImagesToFierbase(files.avatar[0]);
            }
            if (files?.certificate) {
                if (user.certificate) {
                    await deleteFileFromFirebase(user.certificate);
                }
                user.certificate = await uploadImagesToFierbase(files.certificate[0]);
            }
            if (files?.nabh) {
                if (user.nabh) {
                    await deleteFileFromFirebase(user.nabh);
                }
                user.nabh = await uploadImagesToFierbase(files.nabh[0]);
            }
        }

        Object.keys(updates).forEach((key) => {
            user[key] = updates[key];
        });

        await user.save();

        const data = await ejs.renderFile(
            path.join(__dirname, "../views/updateUser.ejs"), { user: user.name }
        );

        await sendEmail({
            email: user?.email,
            subject: `Your request for profile update is registered.`,
            data
        });

        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "User updated successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return next(new ErrorHandler("User update failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
        }

        if (user?.avatar) {
            await deleteFileFromFirebase(user.avatar);
        }
        if (user?.certificate) {
            await deleteFileFromFirebase(user.certificate);
        }
        if (user?.nabh) {
            await deleteFileFromFirebase(user.nabh);
        }

        await User.findByIdAndDelete(userId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return next(new ErrorHandler("User deletion failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return next(new ErrorHandler("Please provide an email or phone number and password", StatusCodes.BAD_REQUEST));
        }

        let user;
        if (validator.isEmail(identifier)) {
            user = await User.findOne({ email: identifier });
        } else if (validator.isMobilePhone(identifier, 'any')) {
            user = await User.findOne({ phone: identifier });
        } else {
            return next(new ErrorHandler("Invalid email or phone number format", StatusCodes.BAD_REQUEST));
        }

        if (!user) {
            return next(new ErrorHandler("Invalid email/phone number or password", StatusCodes.UNAUTHORIZED));
        }

        if (user.status !== "Approved") {
            return next(new ErrorHandler("You're profile was not approved", StatusCodes.UNAUTHORIZED));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email/phone number or password", StatusCodes.UNAUTHORIZED));
        }

        // Assuming you generate a token for the user on successful login
        const token = generateToken(user);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "User logged in successfully",
            token,
            user: user?._id
        });
    } catch (error) {
        console.error("Error during login:", error);
        return next(new ErrorHandler("Login failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }
    const resetToken = user.getResetPassword()
    await user.save({ validateBeforeSave: false })
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`
    const data = await ejs.renderFile(
        path.join(__dirname, "../views/forgotPassEmail.ejs"), { email: user.email, restPass: resetPasswordUrl }
    );
    try {
        try {
            await sendEmail({
                email: user.email,
                subject: `Vaidyanearme password Recovery`,
                data
            });
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            return next(new ErrorHandler("Failed to send registration email", StatusCodes.INTERNAL_SERVER_ERROR));
        }
        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Email sent to ${resetPasswordUrl}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message, 500))
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        if (!user) {
            return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400))
        }
        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("password does not match with confirm password", 400))
        }
        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        const tokenUser = generateToken(user);
        await user.save();
        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error during update password:", error);
        return next(new ErrorHandler("Update password failed", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const filterUsers = async (req, res, next) => {
    const { specialities, state, city, minExperience, maxExperience, gender } = req.query;

    try {
        let query = { status: "Approved" };

        if (specialities) {
            query.specialities = { $in: specialities.split(',') };
        }
        if (state) {
            query.state = state;
        }
        if (city) {
            query.city = city;
        }
        if (minExperience || maxExperience) {
            query.experience = {};
            if (minExperience) {
                query.experience.$gte = minExperience;
            }
            if (maxExperience) {
                query.experience.$lte = maxExperience;
            }
        }
        if (gender) {
            query.gender = gender;
        }

        const users = await User.find(query).populate('city').populate('specialities');
        const usersWithoutPasswords = users.map(user => {
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        });
        return res.status(StatusCodes.OK).json({
            success: true,
            users: usersWithoutPasswords,
        });
    } catch (error) {
        console.error("Error filtering users:", error);
        return next(new ErrorHandler("Error filtering users", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getSingleUser = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('city').populate('specialities');
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        }
        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;
        return res.status(StatusCodes.OK).json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Error getting user:', error);
        return next(new ErrorHandler("Error getting user", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ status: "Approved" }).populate('city').populate('specialities');
        const usersWithoutPasswords = users.map(user => {
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            users: usersWithoutPasswords,
        });
    } catch (error) {
        console.error('Error getting users:', error);
        return next(new ErrorHandler("Error getting users", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllPendingUsers = async (req, res, next) => {
    try {
        const pendingUsers = await User.find({ status: 'Pending' }).populate('city').populate('specialities');
        const pendingUsersWithoutPasswords = pendingUsers.map(user => {
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            users: pendingUsersWithoutPasswords,
        });
    } catch (error) {
        console.error('Error getting pending users:', error);
        return next(new ErrorHandler("Error getting pending users", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const changeUserStatus = async (req, res, next) => {
    const { userId } = req.params;
    const { status } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        }
        if (status == "Approved") {
            try {
                const data = await ejs.renderFile(
                    path.join(__dirname, "../views/approvregister.ejs"), { user: user.name }
                );
                await sendEmail({
                    email: user?.email,
                    subject: `Your profile has been successfully updated.`,
                    data
                });
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                return next(new ErrorHandler("Failed to send registration email", StatusCodes.INTERNAL_SERVER_ERROR));
            }
            user.status = status;
            await user.save();
        } else {
            try {

                if (!user) {
                    return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
                }

                if (user?.avatar) {
                    await deleteFileFromFirebase(user.avatar);
                }
                if (user?.certificate) {
                    await deleteFileFromFirebase(user.certificate);
                }
                if (user?.nabh) {
                    await deleteFileFromFirebase(user.nabh);
                }

                await User.findByIdAndDelete(userId);
                
                const data = await ejs.renderFile(
                    path.join(__dirname, "../views/rejected.ejs"), { user: user.name }
                );

                await sendEmail({
                    email: user?.email,
                    subject: `Your profile has been rejected.`,
                    data: data
                });
                console.log("Email sent successfully on reject")
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                return next(new ErrorHandler("Failed to send registration email", StatusCodes.INTERNAL_SERVER_ERROR));
            }
        }

        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;
        return res.status(StatusCodes.OK).json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Error changing user status:', error);
        return next(new ErrorHandler("Error changing user status", StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    registerUser,
    updateUser,
    deleteUser,
    loginUser,
    forgotPassword,
    updatePassword,
    filterUsers,
    getSingleUser,
    changeUserStatus,
    getAllUsers,
    getAllPendingUsers
}
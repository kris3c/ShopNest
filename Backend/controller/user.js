const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("../utils/cloudinary");

const createUser = async (req, res, next) => {
  let imagePath;

  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    let imageFile;
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      imageFile = await cloudinary.uploader.upload(dataURI);
    } catch (err) {
      console.log("CLOUDINARY ERROR:", err.message);
      return next(new ErrorHandler("Could not upload image, please try again.", 500));
    }

    const user = {
      name,
      email,
      password,
      avatar: imageFile.secure_url,
      avatarId: imageFile.public_id,
    };

    imagePath = user.avatarId;

    const activationToken = createActivationToken(user);
    const activationUrl = `https://shop-nest-bice.vercel.app/activation/${activationToken}`;

    console.log("Sending activation email to:", email);

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your email",
        message: `<h2>Hello there! Check this link to activate your account: <a href="${activationUrl}">click me</a></h2>`,
      });
      console.log("Email sent successfully");
      res.status(201).json({
        success: true,
        message: `please check your email to activate your account!`,
      });
    } catch (error) {
      console.log("EMAIL ERROR:", error.message);
      try {
        await cloudinary.uploader.destroy(imagePath);
      } catch (err) {
        console.log(`failed deleting image: ${imagePath}`);
      }
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (err) {
    console.log("OUTER ERROR:", err.message);
    try {
      await cloudinary.uploader.destroy(imagePath);
    } catch (err) {
      console.log(`failed deleting image: ${imagePath}`);
    }
    return next(new ErrorHandler(err.message, 400));
  }
};

const activation = catchAsyncErrors(async (req, res, next) => {
  let imagePath;

  try {
    const { activation_token } = req.body;
    const newUser = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }

    imagePath = newUser.avatarId;

    const { name, email, password, avatar, avatarId } = newUser;

    let user = await User.findOne({ email });
    if (user) {
      return next(new ErrorHandler("User already exists", 400));
    }

    user = await User.create({ name, email, avatar, avatarId, password });
    sendToken(user, 201, res);
  } catch (err) {
    try {
      await cloudinary.uploader.destroy(imagePath);
    } catch (err) {
      console.log(`failed deleting image: ${imagePath}`);
    }
    return next(new ErrorHandler(err.message, 500));
  }
});

const loginUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please provide all fields!", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User doesn't exist!", 400));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Please provide the correct information", 400));
    }

    sendToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const getUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User doesn't exist", 400));
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const updateUserInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password, phoneNumber, name } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Please provide the correct information", 400));
    }

    user.name = name;
    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const updateAvatar = catchAsyncErrors(async (req, res, next) => {
  try {
    const existsUser = await User.findById(req.user.id);
    const oldImagePath = existsUser.avatarId;

    try {
      await cloudinary.uploader.destroy(oldImagePath);
    } catch (err) {
      console.log(`failed deleting image: ${oldImagePath}`);
    }

    let imageFile;
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      imageFile = await cloudinary.uploader.upload(dataURI);
    } catch (err) {
      console.log("CLOUDINARY ERROR:", err.message);
      return next(new ErrorHandler("Could not upload image, please try again.", 500));
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
      avatar: imageFile.secure_url,
      avatarId: imageFile.public_id,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const addAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const sameNameAddress = user.addresses.find(
      (address) => address.addressName === req.body.addressName
    );

    if (sameNameAddress) {
      return next(new ErrorHandler(`${req.body.addressName} address already exists`));
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const deleteAddress = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    await User.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );

    const user = await User.findById(userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const changePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordValid = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Old password is incorrect.", 400));
    }

    if (req.body.password !== req.body.confirmedPassword) {
      return next(new ErrorHandler("Password should be the same in both inputs.", 400));
    }

    if (req.body.password === req.body.oldPassword) {
      return next(new ErrorHandler("Old and new password shouldn't be the same.", 400));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const forgetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body;
    const userPayload = await User.findOne({ email }).select("+password");

    if (!userPayload) {
      return next(new ErrorHandler("Couldn't find the user", 400));
    }

    const token = createActivationToken({ email: userPayload.email });
    userPayload.resetToken = token;
    await userPayload.save();

    const ForgetUrl = `https://shop-nest-bice.vercel.app/change-forget-password/${token}`;

    try {
      await sendMail({
        email: userPayload.email,
        subject: "Forget the password",
        message: `<h2>Hello there! Check this link to change your password: <a href="${ForgetUrl}">click me</a>. It expires in 5 minutes.</h2>`,
      });
      res.status(201).json({ success: true, message: `please check your email to change password!` });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const changeForgetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { token } = req.params;
    const newUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }

    let user = await User.findOne({ email: newUser.email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Couldn't find the user", 400));
    }

    const isPasswordValid = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Old password is incorrect.", 400));
    }

    if (req.body.password !== req.body.confirmedPassword) {
      return next(new ErrorHandler("Password should be the same in both inputs.", 400));
    }

    if (req.body.password === req.body.oldPassword) {
      return next(new ErrorHandler("Old and new password shouldn't be the same.", 400));
    }

    if (user.resetToken !== token) {
      return next(new ErrorHandler("Link Expired!", 400));
    }

    user.password = req.body.password;
    user.resetToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const createActivationToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "5m",
  });
};

exports.createUser = createUser;
exports.activation = activation;
exports.loginUser = loginUser;
exports.getUser = getUser;
exports.updateUserInfo = updateUserInfo;
exports.updateAvatar = updateAvatar;
exports.addAddress = addAddress;
exports.deleteAddress = deleteAddress;
exports.changePassword = changePassword;
exports.forgetPassword = forgetPassword;
exports.changeForgetPassword = changeForgetPassword;

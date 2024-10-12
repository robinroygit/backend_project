import { configDotenv } from "dotenv";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import bcrypt from 'bcrypt';
// import jwt from "jsonwebtoken";


configDotenv({path:"./.env"});

const generateAccessAndRefreshToken = async (userId) => {

  try {
    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token !")
  }

}


const loginAdmin = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  try {
    // Find the user by email

     const user = await User.findOne({ email })


    
    // If user doesn't exist or isn't an admin, return error
    if (!user || user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect!")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 
  const options = {
    httpOnly: true,
    // secure: true,
    // maxAge: 900000
}


  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "admin logged In Successfully"
      )
    )


  } catch (error) {

   throw new ApiError(500,error?.message || "somthing went wrong login admin")

  }
})


//logout user
const logoutAdmin = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        accessToken: undefined
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res.status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "Admin Logged out"))


})


const changeCurrentPassword = asyncHandler(async  (req,res) => {


  const {oldPassword,newPassword} = req.body

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

    // Validate the new password (you can add more validations here if needed)
    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

// Find the user by userId
  const user = await User.findById(req.user?._id)
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
          .status(200)
          .json(new ApiResponse(200,{},"password changed successfully"))
  
})


//  const createAdminAccount =  asyncHandler(async(req,res)=> {
//   const adminEmail = process.env.ADMIN_EMAIL;
//   const adminPassword = process.env.ADMIN_PASSWORD;

//   const existingAdmin = await User.findOne({ role: 'admin' });

//   if (!existingAdmin && adminEmail && adminPassword) {
//     const hashedPassword = await bcrypt.hash(adminPassword, 10);

//     const admin = new User({
//       email: adminEmail,
//       password: hashedPassword,
//       name: 'Admin User',
//       role: 'admin'
//     });

//     await admin.save();
//     console.log('Admin account created with email:', adminEmail);
//   } else if (existingAdmin) {
//     console.log('Admin account already exists');
//   } else {
//     console.log('Admin credentials are missing');
//   }
// })



async function createAdminAccount() {
  const adminFistname = process.env.ADMIN_FIRSTNAME;
  const adminLastname = process.env.ADMIN_LASTNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (!existingAdmin && adminEmail && adminPassword) {
    // const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      firstname: adminFistname,
      lastname: adminLastname,
      password: adminPassword,
      email:adminEmail,
      phoneNo:'',
      role: 'admin'
    });

    /*const users = [
      
    ];
await users.create(users);*/


    await admin.save();
    console.log('Admin account created with email:', admin.email);
  } else if (existingAdmin) {
    console.log('Admin account already exists');
  } else {
    console.log('Admin credentials are missing');
  }
}



// createAdminAccount();
// export {
//     createAdminAccount
// }



const getAllUsers = asyncHandler(async (req,res)=>{

  
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

        // Find all users where the role is not 'admin'
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password -refreshToken'); // Exclude password field

        if (users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
        }

  
    // Return the list of users
    return res
          .status(200)
          .json(new ApiResponse(200,users,"current user fetched successfully"))
  
  } catch (error) {
   throw new ApiError(401,error?.message || "Refresh token is expired or used")

    
  }
})





export { 
     getAllUsers,
      loginAdmin,
        logoutAdmin,
          createAdminAccount,
            changeCurrentPassword,
  //    refreshAccessToken,
  //     changeCurrentPassword,
  //      getCurrentUser,
  //       updateAccountDetails,
  //       UserChannelProfile,
     };

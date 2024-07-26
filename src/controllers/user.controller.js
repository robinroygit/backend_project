import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// generating access and refresh token
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

//resigtering the user
const registerUser = asyncHandler(async (req, res) => {
  //ALL STEPS
  //get the user detail from frontend
  //check if validation not empty
  //check for images avatar and coverimage
  //upload images to cloudinary
  //create user object create entry in db
  //remove password and refresh token from response
  //check for user Creation
  // return response


  const { fullName, email, userName, password } = req.body;


  if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  };

  //check if user exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "Email with email and username already exists")
  }

  //checking if user has uploaded avatar and coverImage

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  // const coverImageLocalPath = await req.files?.coverImage[0]?.path;
  // console.log(req.files);

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  // const avatarLocalPath = req.files.avatar ? req.files.avatar[0].path: null;
  // const coverImageLocalPath = req.files.coverImage ? req.files.coverImage[0].path : null;


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is requiredfbksdfhksdf");
  }
  // if (!coverImageLocalPath) {
  //     throw new ApiError(400, "coverimage file is required");
  // }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required00000");
  }

  //creating user object for db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  })

  // const createdUser = User.findById(user._id).select("-password -refreshToken")
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }


  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )

})


//login user
const loginUser = asyncHandler(async (req, res) => {
  // get data from req.body
  // userName or email
  //find the user
  //check password
  //generate access and refresh token
  //send cookies
  //send response --user logged in
  const { email, userName, password } = req.body

  if (!email && !userName) {
    throw new ApiError(400, "Username or email is required")
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exists")
  }

  // checking if password is valid
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
        "User logged In Successfully"
      )
    )




})

const logoutUser = asyncHandler(async (req, res) => {

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
    .json(new ApiResponse(200, {}, "User Logged out"))


})


const refreshAccessToken = asyncHandler(async  (req,res) => {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized Request!")
  }

try {
  
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
    }
  
   const {accessToken,newRefreshToken} =  await generateAccessAndRefreshToken(user._id)
  
   const options = {
    httpOnly:true,
    secure:true
   }
  
   return res
            .cookie("accessToken",accessToken)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
              new ApiResponse(
                200,
                {accessToken,newRefreshToken},
                "access token refreshed successfully"
              )
            )
} catch (error) {
   throw new ApiError(401,error?.message || "Refresh token is expired or used")
}

})

export { loginUser, logoutUser, registerUser,refreshAccessToken };





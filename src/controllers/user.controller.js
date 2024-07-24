import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";


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
    console.log(fullName);
    if (
        [fullName, email, userName, password].some((field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    };

    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "Email with email and username already exists")
    }

    //checking if user has uploaded avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

  const avatar = await  uploadOnCloudinary(avatarLocalPath)
  const coverImage= await  uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "Avatar file is required");
  }

 const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    userName:userName.toLowerCase()
  })

  const createdUser = User.findById(user._id).select("-password -refreshToken")

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )

})

export { registerUser }
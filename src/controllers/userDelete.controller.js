import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const deleteUser = asyncHandler(async  (req,res,next) => {
  console.log("=========",req);

    try {
       
        const result = await User.deleteOne({ email: "Robinroy.9@gmail.com" });
        if (result.deletedCount === 1) {
          console.log('User successfully deleted');
            return res.status(201).json(
                new ApiResponse(200, "User deleted Successfully")
            )
        } else {
          console.log('User not found');
          res.status(201).json(
            new ApiResponse(200,"User userNot found")
        )
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }

})




export { deleteUser }
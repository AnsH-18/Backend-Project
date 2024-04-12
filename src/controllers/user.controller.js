import asyncHandler from "../utils/AsyncHandler.js";


const userRegister = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export default userRegister
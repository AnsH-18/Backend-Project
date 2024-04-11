class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something Went Wrong",
        stack = "",
        data = null,
        errors = []
    ){
        super(message)
        this.statusCode = statusCode
        this.data = data
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError
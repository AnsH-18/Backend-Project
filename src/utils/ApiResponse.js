class ApiResponse{
    constructor(
        statusCode,
        data,
        message = "Success"
    ){
        this.success = statusCode
        this.message = message
        this.data = data
    }
}

export default ApiResponse
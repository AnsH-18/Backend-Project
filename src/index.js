import dbConnection from "./db/index.js";
import dotenv from "dotenv"
import app from "./app.js";

dotenv.config({
    path : "./.env"
})

dbConnection()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("App running on: ", process.env.PORT);
    })
})
.catch((err) => {
    console.log("MongoDb connection failed", err)
})
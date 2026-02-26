import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on PORT: ", port);
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start server due to database connection issues:",
      err,
    );
  });

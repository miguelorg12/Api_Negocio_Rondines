import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./configs/data-source";
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import "reflect-metadata";
import express from "express";
import userRoutes from "../src/routes/user.route";
import roleRoutes from "../src/routes/role.route";
import companyRoutes from "../src/routes/company.route";
import branchRoutes from "../src/routes/branch.router";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World!");
});

const apiRouter = express.Router();
app.use("/api/v1", apiRouter);

apiRouter.use("/users", userRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/companies", companyRoutes);
apiRouter.use("/branches", branchRoutes);

export default app;

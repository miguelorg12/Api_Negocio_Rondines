import "reflect-metadata";
import express from "express";
import cors from "cors";
import userRoutes from "../src/routes/user.route";
import roleRoutes from "../src/routes/role.route";
import companyRoutes from "../src/routes/company.route";
import branchRoutes from "../src/routes/branch.router";
import patrolRoutes from "../src/routes/patrol.router";
import shifRoutes from "../src/routes/shift.router";
import patrolAssignmentRoutes from "../src/routes/patrol_assigment.router";
import guardRoutes from "../src/routes/guard.route";
import incidentRoutes from "../src/routes/incident.route";
import { swaggerSpec, swaggerUi } from "./configs/swagger";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World!");
});

const apiRouter = express.Router();
app.use("/api/v1", apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

apiRouter.use("/users", userRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/companies", companyRoutes);
apiRouter.use("/branches", branchRoutes);
apiRouter.use("/shifts", shifRoutes);
apiRouter.use("/patrols", patrolRoutes);
apiRouter.use("/patrol-assignments", patrolAssignmentRoutes);
apiRouter.use("/guards", guardRoutes);
apiRouter.use("/incidents", incidentRoutes);

export default app;

import "reflect-metadata";
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route";
import roleRoutes from "./routes/role.route";
import companyRoutes from "./routes/company.route";
import branchRoutes from "./routes/branch.router";
import patrolRoutes from "./routes/patrol.router";
import shifRoutes from "./routes/shift.router";
import patrolAssignmentRoutes from "./routes/patrol_assigment.router";
import patrolRecordRoutes from "./routes/patrol_record.route";
import guardRoutes from "./routes/guard.route";
import incidentRoutes from "./routes/incident.route";
import checkpointRoutes from "./routes/checkpoint.route";
import biometricRoutes from "./routes/biometric.route";
import shiftValidationRoutes from "./routes/shift_validation.route";
import shiftValidationBiometricRoutes from "./routes/shift_validation_biometric.route";
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
apiRouter.use("/checkpoints", checkpointRoutes);
apiRouter.use("/shifts", shifRoutes);
apiRouter.use("/patrols", patrolRoutes);
apiRouter.use("/patrol-assignments", patrolAssignmentRoutes);
apiRouter.use("/patrol-records", patrolRecordRoutes);
apiRouter.use("/guards", guardRoutes);
apiRouter.use("/incidents", incidentRoutes);
apiRouter.use("/biometric", biometricRoutes);
apiRouter.use("/shift-validation", shiftValidationRoutes);
apiRouter.use("/shift-validation/biometric", shiftValidationBiometricRoutes);

export default app;

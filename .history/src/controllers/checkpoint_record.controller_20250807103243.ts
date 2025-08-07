import { Request, Response } from "express";
import { CheckpointRecordService } from "@services/checkpoint_record.service";
import {
  CheckpointRecordCreateRequest,
  CheckpointRecordUpdateRequest,
  CheckpointRecordFilterRequest,
} from "@dto/checkpoint_record.dto";

export class CheckpointRecordController {
  private checkpointRecordService: CheckpointRecordService;

  constructor() {
    this.checkpointRecordService = new CheckpointRecordService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CheckpointRecordCreateRequest = req.body;
      const result = await this.checkpointRecordService.create(data);
      res.status(201).json({
        message: "Registro de checkpoint creado exitosamente",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error al crear el registro de checkpoint",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data: CheckpointRecordUpdateRequest = req.body;
      const result = await this.checkpointRecordService.update(id, data);
      res.status(200).json({
        message: "Registro de checkpoint actualizado exitosamente",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error al actualizar el registro de checkpoint",
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.checkpointRecordService.findById(id);
      res.status(200).json({
        message: "Registro de checkpoint encontrado exitosamente",
        data: result,
      });
    } catch (error) {
      res.status(404).json({
        message: error instanceof Error ? error.message : "Error al buscar el registro de checkpoint",
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: CheckpointRecordFilterRequest = req.query;
      const result = await this.checkpointRecordService.findAll(filters);
      res.status(200).json({
        message: "Registros de checkpoint obtenidos exitosamente",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error al obtener los registros de checkpoint",
      });
    }
  }

  async findAllByBranchId(req: Request, res: Response): Promise<void> {
    try {
      const branchId = parseInt(req.params.branchId);
      const result = await this.checkpointRecordService.findAllByBranchId(branchId);
      res.status(200).json({
        message: "Registros de checkpoint por sucursal obtenidos exitosamente",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error al obtener los registros de checkpoint por sucursal",
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.checkpointRecordService.delete(id);
      res.status(200).json({
        message: "Registro de checkpoint eliminado exitosamente",
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Error al eliminar el registro de checkpoint",
      });
    }
  }
}

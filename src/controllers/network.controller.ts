import { NetworkService } from "@services/network.service";
import { Request, Response } from "express";
import {
  CreateNetworkDto,
  PartialNetworkDto,
} from "@interfaces/dto/network.dto";
import { validationResult } from "express-validator";

const networkService = new NetworkService();

export const getAllNetworks = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const networks = await networkService.findAll();
    return res.status(200).json({
      message: "Redes obtenidas correctamente",
      data: networks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las redes",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const createNetwork = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Error en la validación de datos",
        errors: errors.array(),
      });
    }
    const networkData: CreateNetworkDto = req.body;
    const newNetwork = await networkService.create(networkData);
    return res
      .status(201)
      .json({ message: "Red creada correctamente", data: newNetwork });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear la red",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getNetworkById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const networkId = parseInt(req.params.id);
    const network = await networkService.findById(networkId);
    if (!network) {
      return res.status(404).json({ message: "Red no encontrada" });
    }
    return res.status(200).json({ message: "Red encontrada", data: network });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la red",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const getNetworksByBranch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const branchId = parseInt(req.params.branchId);
    const networks = await networkService.findByBranchId(branchId);
    return res.status(200).json({
      message: "Redes de la sucursal obtenidas correctamente",
      data: networks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las redes de la sucursal",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const updateNetwork = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Error en la validación de datos",
        errors: errors.array(),
      });
    }
    const networkId = parseInt(req.params.id);
    const updateData: PartialNetworkDto = req.body;
    const network = await networkService.findById(networkId);
    if (!network) {
      return res.status(404).json({ message: "Red no encontrada" });
    }
    const updatedNetwork = await networkService.update(networkId, updateData);
    return res.status(200).json({
      message: "Red actualizada correctamente",
      data: updatedNetwork,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar la red",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export const deleteNetwork = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const networkId = parseInt(req.params.id);
    const network = await networkService.findById(networkId);
    if (!network) {
      return res.status(404).json({ message: "Red no encontrada" });
    }
    await networkService.delete(networkId);
    return res
      .status(200)
      .json({ message: "Red eliminada correctamente", data: network });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar la red",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

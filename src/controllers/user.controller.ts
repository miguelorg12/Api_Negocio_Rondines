import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto } from "../interfaces/dto/user.dto";
import { validationResult } from "express-validator";

const userService = new UserService();

export const getAllUsers = async(_req:Request, res:Response) => {
    const users = await userService.findAll();
    res.status(200).json(users);
}

export const getUserById = async(req:Request, res:Response) => {
    const userId = parseInt(req.params.id);
    if(!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await userService.findById(userId);
    return res.status(200).json(user);
}

export const createUser = async(req:Request, res:Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const user = await userService.create(req.body);
    res.status(201).json(user);
}


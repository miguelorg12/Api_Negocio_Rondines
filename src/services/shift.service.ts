import { AppDataSource } from "@configs/data-source";
import { Shift } from "@interfaces/entity/shift.entity";
import { ShiftDto } from "@interfaces/dto/shift.dto";
import { Repository } from "typeorm";

export class ShiftService {
  private shiftRepository: Repository<Shift>;

  constructor() {
    this.shiftRepository = AppDataSource.getRepository(Shift);
  }

  async create(shiftDto: ShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create(shiftDto);
    return await this.shiftRepository.save(shift);
  }

  async getAll(): Promise<Shift[]> {
    return await this.shiftRepository.find();
  }

  async getById(id: number): Promise<Shift | null> {
    return await this.shiftRepository.findOneBy({ id });
  }

  async update(id: number, shiftDto: ShiftDto): Promise<Shift | null> {
    const shift = await this.getById(id);
    if (!shift) {
      throw new Error("Turno no encontrado");
    }
    await this.shiftRepository.update(id, shiftDto);
    return this.getById(id);
  }

  async delete(id: number): Promise<Shift | null> {
    const shift = await this.getById(id);
    if (!shift) {
      throw new Error("Turno no encontrado");
    }
    await this.shiftRepository.softDelete(id);
    return shift;
  }
}

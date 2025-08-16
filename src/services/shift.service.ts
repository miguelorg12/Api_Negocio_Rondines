import { AppDataSource } from "@configs/data-source";
import { Shift } from "@interfaces/entity/shift.entity";
import { ShiftDto, PartialShiftDto } from "@interfaces/dto/shift.dto";
import { Repository } from "typeorm";

export class ShiftService {
  private shiftRepository: Repository<Shift>;

  constructor() {
    this.shiftRepository = AppDataSource.getRepository(Shift);
  }

  // Método privado para convertir string de hora a Date
  private parseTimeString(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  async create(shiftDto: ShiftDto): Promise<Shift> {
    const shift = this.shiftRepository.create({
      name: shiftDto.name,
      start_time: this.parseTimeString(shiftDto.start_time),
      end_time: this.parseTimeString(shiftDto.end_time),
      branch: { id: shiftDto.branch_id },
    });
    return await this.shiftRepository.save(shift);
  }

  async getAll(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      relations: ["branch"],
    });
  }

  async getById(id: number): Promise<Shift | null> {
    return await this.shiftRepository.findOne({
      where: { id },
      relations: ["branch"],
    });
  }

  async getByBranchId(branchId: number): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { branch: { id: branchId } },
      relations: ["branch"],
      order: { start_time: "ASC" },
    });
  }

  async update(id: number, shiftDto: PartialShiftDto): Promise<Shift | null> {
    const shift = await this.getById(id);
    if (!shift) {
      throw new Error("Turno no encontrado");
    }

    const updateData: any = {};
    if (shiftDto.name) updateData.name = shiftDto.name;
    if (shiftDto.start_time)
      updateData.start_time = this.parseTimeString(shiftDto.start_time);
    if (shiftDto.end_time)
      updateData.end_time = this.parseTimeString(shiftDto.end_time);
    if (shiftDto.branch_id) updateData.branch = { id: shiftDto.branch_id };

    await this.shiftRepository.update(id, updateData);
    return await this.getById(id);
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

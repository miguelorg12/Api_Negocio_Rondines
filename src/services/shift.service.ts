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
  // Usa una fecha base (1970-01-01) para almacenar solo la hora
  private parseTimeString(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    
    // Validar que las horas y minutos sean válidos
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Hora inválida: ${timeString}`);
    }
    
    // Usar fecha base 1970-01-01 para almacenar solo la hora
    const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
    return date;
  }

  // Método para manejar turnos que cruzan medianoche
  private adjustTimeForMidnightCrossing(startTime: string, endTime: string): { start: Date, end: Date } {
    const start = this.parseTimeString(startTime);
    const end = this.parseTimeString(endTime);
    
    // Si la hora de fin es menor que la de inicio, significa que cruza medianoche
    if (end < start) {
      // Agregar un día a la hora de fin
      end.setDate(end.getDate() + 1);
    }
    
    return { start, end };
  }

  async create(shiftDto: ShiftDto): Promise<Shift> {
    // Usar el método que maneja medianoche
    const { start, end } = this.adjustTimeForMidnightCrossing(shiftDto.start_time, shiftDto.end_time);
    
    const shift = this.shiftRepository.create({
      name: shiftDto.name,
      start_time: start,
      end_time: end,
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
    
    // Si se actualizan ambas horas, usar el método de medianoche
    if (shiftDto.start_time && shiftDto.end_time) {
      const { start, end } = this.adjustTimeForMidnightCrossing(shiftDto.start_time, shiftDto.end_time);
      updateData.start_time = start;
      updateData.end_time = end;
    } else {
      // Si solo se actualiza una hora, usar parseTimeString normal
      if (shiftDto.start_time) {
        updateData.start_time = this.parseTimeString(shiftDto.start_time);
      }
      if (shiftDto.end_time) {
        updateData.end_time = this.parseTimeString(shiftDto.end_time);
      }
    }
    
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

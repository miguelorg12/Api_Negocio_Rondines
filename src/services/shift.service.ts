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
  // Ahora que usamos columnas de tipo 'time', solo necesitamos la hora
  private parseTimeString(timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Validar que las horas y minutos sean válidos
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Hora inválida: ${timeString}`);
    }

    // Para columnas de tipo 'time', usamos una fecha base (1970-01-01)
    // PostgreSQL extraerá solo la parte de tiempo
    const date = new Date(1970, 0, 1, hours, minutes, 0, 0);
    return date;
  }

  // Método para manejar turnos que cruzan medianoche
  // Ahora que usamos columnas 'time', este método es principalmente para validación
  private validateShiftTimes(startTime: string, endTime: string): void {
    const start = this.parseTimeString(startTime);
    const end = this.parseTimeString(endTime);

    // Para turnos que cruzan medianoche, la hora de fin será menor que la de inicio
    // Esto es válido y se maneja correctamente en la lógica de negocio
    // No necesitamos ajustar fechas aquí porque solo almacenamos la hora
  }

  async create(shiftDto: ShiftDto): Promise<Shift> {
    // Validar que los horarios sean lógicos
    this.validateShiftTimes(shiftDto.start_time, shiftDto.end_time);

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

    // Si se actualizan ambas horas, validar que sean lógicas
    if (shiftDto.start_time && shiftDto.end_time) {
      this.validateShiftTimes(shiftDto.start_time, shiftDto.end_time);
      updateData.start_time = this.parseTimeString(shiftDto.start_time);
      updateData.end_time = this.parseTimeString(shiftDto.end_time);
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

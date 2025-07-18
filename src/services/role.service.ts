import { AppDataSource } from "@configs/data-source";
import { Role } from "@interfaces/entity/role.entity";
import { CreateRoleDto, PartialCreateRoleDto } from "@interfaces/dto/role.dto";
import { Repository } from "typeorm";

export class RoleService {
  private roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async create(roleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(roleDto);
    return await this.roleRepository.save(role);
  }

  async update(
    id: number,
    roleDto: PartialCreateRoleDto
  ): Promise<Role | null> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new Error("Role not found");
    }
    await this.roleRepository.update(id, roleDto);
    return this.findById(id);
  }

  async findById(id: number): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id },
    });
  }

  async delete(id: number): Promise<Role | null> {
    const role = await this.findById(id);
    if (!role) {
      throw new Error("Role not found");
    }
    await this.roleRepository.softDelete(id);
    return role;
  }
}

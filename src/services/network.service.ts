import { AppDataSource } from "@configs/data-source";
import { Network } from "@interfaces/entity/network.entity";
import { Repository } from "typeorm";
import {
  PartialNetworkDto,
  CreateNetworkDto,
} from "@interfaces/dto/network.dto";
import { Branch } from "@interfaces/entity/branch.entity";

export class NetworkService {
  private networkRepository: Repository<Network>;
  private branchRepository: Repository<Branch>;

  constructor() {
    this.networkRepository = AppDataSource.getRepository(Network);
    this.branchRepository = AppDataSource.getRepository(Branch);
  }

  async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
    const branch = await this.branchRepository.findOne({
      where: { id: createNetworkDto.branch_id },
    });
    if (!branch) {
      throw new Error("Branch not found");
    }

    const network = this.networkRepository.create({
      ssid: createNetworkDto.ssid,
      password: createNetworkDto.password,
      branch: { id: createNetworkDto.branch_id },
    });
    return await this.networkRepository.save(network);
  }

  async findAll(): Promise<Network[]> {
    return await this.networkRepository.find({
      relations: ["branch"],
    });
  }

  async findById(id: number): Promise<Network | null> {
    return await this.networkRepository.findOne({
      where: { id },
      relations: ["branch"],
    });
  }

  async findByBranchId(branchId: number): Promise<Network[]> {
    return await this.networkRepository.find({
      where: { branch: { id: branchId } },
      relations: ["branch"],
    });
  }

  async update(
    id: number,
    updateData: PartialNetworkDto
  ): Promise<Network | null> {
    const network = await this.findById(id);
    if (!network) {
      throw new Error("Network not found");
    }

    // Update the network properties
    if (updateData.ssid !== undefined) network.ssid = updateData.ssid;
    if (updateData.password !== undefined)
      network.password = updateData.password;

    // Update branch relationship if provided
    if (updateData.branch_id !== undefined) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateData.branch_id },
      });
      if (!branch) {
        throw new Error("Branch not found");
      }
      network.branch = branch;
    }

    // Save the updated network
    return await this.networkRepository.save(network);
  }

  async delete(id: number): Promise<Network | null> {
    const network = await this.findById(id);
    if (!network) {
      throw new Error("Network not found");
    }
    await this.networkRepository.softDelete(id);
    return network;
  }
}

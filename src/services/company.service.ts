import { AppDataSource } from "@configs/data-source";
import { Company } from "@interfaces/entity/company.entity";
import { Repository } from "typeorm";
import {
  PartialCompanyDto,
  CreateCompanyDto,
} from "@interfaces/dto/company.dto";

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor() {
    this.companyRepository = AppDataSource.getRepository(Company);
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return await this.companyRepository.save(createCompanyDto);
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findById(id: number): Promise<Company | null> {
    return await this.companyRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateData: PartialCompanyDto
  ): Promise<Company | null> {
    const company = await this.findById(id);
    if (!company) {
      throw new Error("Company not found");
    }
    await this.companyRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<Company | null> {
    const company = await this.findById(id);
    if (!company) {
      throw new Error("Company not found");
    }

    await this.companyRepository.softDelete(id);
    return company;
  }
}

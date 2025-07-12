import { AppDataSource } from "../configs/data-source";
import { CreateUserDto } from "../interfaces/dto/user.dto";
import { User } from "../interfaces/entity/user.entity";
import { Repository } from "typeorm";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

   async create(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
}

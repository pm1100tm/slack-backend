import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageConstService } from '../../const/message-const';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { CreateUserDTO } from '../dto/request/create-user.dto';
import { SocialSignUpType } from '../../const/enum-const';
import { ResponseDataDTO } from '../dto/response/response-data.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  /**
   * 이메일로 한 명의 유저 데이터 취득 서비스
   * @param email
   * @returns User
   */
  async getUserByEmail(email: string): Promise<User> {
    this.logger.log(`getUserByEmail`);
    return await this.userRepository.selectUserByEmail(email);
  }

  /**
   * 이메일로 한 명의 유저 데이터 취득 서비스
   * @param email
   * @returns User
   */
  async getActiveUserByEmail(email: string): Promise<User> {
    this.logger.log(`getActiveUserByEmail`);
    return await this.userRepository.selectActiveUserByEmail(email);
  }

  /**
   * 유저 회원가입 서비스
   * @param CreateUserDTO
   * @returns ResponseDataDTO
   */
  async createUser(createUserDTO: CreateUserDTO): Promise<ResponseDataDTO> {
    if (createUserDTO.signUpTypeId === SocialSignUpType.DEFAULT) {
      throw new HttpException(
        MessageConstService.ERROR_MSG_REQUIRED_INPUT,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user: User = await this.getUserByEmail(createUserDTO.email);

    if (user) {
      if (!user.isActive) {
        throw new HttpException(
          MessageConstService.ERROR_MSG_IS_ACTIVE_FALSE,
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        MessageConstService.ERROR_MSG_ALREADY_EXIST_USER,
        HttpStatus.CONFLICT,
      );
    }

    await this.userRepository.insertUser(createUserDTO);

    const responseDataDTO: ResponseDataDTO = new ResponseDataDTO();
    responseDataDTO.msg = MessageConstService.SUCCESS_MSG;
    responseDataDTO.statudCode = HttpStatus.CREATED;

    return responseDataDTO;
  }

  async test() {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.signUpTypeId', 'sign_up_type')
      .getMany();
  }
}

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GenerateTokens } from 'src/types/generate-tokens';
import {StringValue} from 'ms'


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<GenerateTokens> {
    const user = await this.userRepo.findOne({
      where: {email: loginDto.email}
    })

    if (!user) {
      throw new UnauthorizedException('Usuário não autorizado');
    }

    const passwordIsValid = await this.hashingService.compare(
      loginDto.password, user.passwordHash
    );
    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida');
    };

    return this.generateTokens(user);
  };

  private async generateTokens(user: User) {
    const expiresIn = this.jwtConfiguration.expiresIn;

    const accessTokenPromise = this.signJwtAsync<Partial<User>>(
      String(user.id),
      this.jwtConfiguration.expiresIn as StringValue,
      {
        name: user.name,
        email: user.email,
      },
    );

    const accessToken = await accessTokenPromise;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      expiresIn
    };
  };

  private signJwtAsync<T>(sub: string, expiresIn: StringValue, payload?: T) {
    return this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      });
  };
}

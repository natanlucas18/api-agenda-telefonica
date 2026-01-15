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
    const user = await this.userRepo.findOneBy({
      email: loginDto.email,
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
    const accessTokenPromise = this.signJwtAsync<Partial<User>>(
      user.id,
      this.jwtConfiguration.expiresIn,
      {
        name: user.name,
        email: user.email,
      },
    );

    const accessToken = await Promise.resolve(accessTokenPromise);
    console.log('acc');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken
    };
  };

  private signJwtAsync<T>(sub: string, expiresIn: number, payload?: T) {
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

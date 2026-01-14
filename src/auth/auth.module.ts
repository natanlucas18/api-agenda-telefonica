import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './bcrypt/bcrypt.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),  
],
  controllers: [AuthController],
  providers: [
    {
      provide:HashingService,
      useClass: BcryptService,
    }, AuthService],
  exports: [HashingService, ConfigModule, JwtModule],
})
export class AuthModule {}

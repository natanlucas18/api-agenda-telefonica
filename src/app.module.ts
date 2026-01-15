import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from './global.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [globalConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [globalConfig.KEY],
      useFactory: (globalConfigurations: ConfigType<typeof globalConfig>) => {
        return {
          type: globalConfigurations.database.type,
          host: globalConfigurations.database.host,
          port: globalConfigurations.database.port,
          username: globalConfigurations.database.username,
          database: globalConfigurations.database.database,
          password: globalConfigurations.database.password,
          autoLoadEntities: globalConfigurations.database.autoLoadEntities,
          synchronize: globalConfigurations.database.synchronize,
        }
      }
    }),
    UsersModule,
    AuthModule,
    ContactsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

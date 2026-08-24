import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { RefreshTokensModule } from './modules/refresh-tokens/refresh-tokens.module';
import { AuthModule } from './modules/core/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/core/auth/guards/jwt-auth.guard';

@Module({
  imports: [ProductsModule, UsersModule, RolesModule, PermissionsModule, UserRolesModule, RolePermissionsModule, RefreshTokensModule, AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const shared = {
          type: 'postgres' as const,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          migrations: [__dirname + '/db/migrations/*.{js,ts}'],
          migrationsRun: configService.get<string>('NODE_ENV') !== 'production',
        };

        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (databaseUrl) {
          return { ...shared, url: databaseUrl };
        }

        const password = configService.get<string>('DB_PASSWORD');
        return {
          ...shared,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: password ?? '',
          database: configService.get<string>('DB_NAME', 'postgres'),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
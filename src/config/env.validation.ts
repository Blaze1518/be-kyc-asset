import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_TYPE: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  DB_URI: string;
}

export function validate(config: Record<string, any>) {
  const validateConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((err) => {
        const constraints = Object.values(err.constraints || {}).join(', ');
        return `Biến môi trường "${err.property}" không hợp lệ: ${constraints}`;
      })
      .join('\n');

    throw new Error(`\n${errorMessages}\n`);
  }

  return validateConfig;
}

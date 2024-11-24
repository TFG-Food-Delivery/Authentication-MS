import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { RolesList } from '../enum';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  surname: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image: string;

  @IsString()
  @IsPhoneNumber('ES')
  phoneNumber: string;

  @IsString()
  @IsEnum(RolesList, {
    message: `role must be one of the following values: ${RolesList}`,
  })
  role: Role;
}

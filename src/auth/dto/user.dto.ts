import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image: string;

  @IsString()
  @IsPhoneNumber('ES')
  phoneNumber: string;
}

import {
  IsEmail,
  IsEnum,
  IsMilitaryTime,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CuisineType, CuisineTypeList } from '../../enum/cuisine-type.enum';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { AddressDto } from './address.dto';

export class CreateRestaurantDto {
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;

  @IsString()
  restaurantName: string;

  @IsUrl()
  @IsOptional()
  image: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsEnum(CuisineTypeList, {
    message: `cuisineType must be one of the following values: ${CuisineTypeList}`,
  })
  cuisineType: CuisineType;

  @IsString()
  @IsMilitaryTime()
  openHour: string;

  @IsString()
  @IsMilitaryTime()
  closeHour: string;
}

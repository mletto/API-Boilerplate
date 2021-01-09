import { IsString, IsOptional, IsBoolean, IsArray, ArrayMinSize, ValidateNested, IsEnum, ValidateIf } from 'class-validator';
import {Type} from 'class-transformer'
import "reflect-metadata";

const accountTypeEnum = [
  'single','organization'
]

class PermissionDto {
  @IsString()
  public type: string;

  @IsBoolean()
  public read: boolean;

  @IsBoolean()
  public write: boolean;

  @IsBoolean()
  public update: boolean;

  @IsBoolean()
  public delete: boolean;

  @IsBoolean()
  public admin: boolean;
}

export class UserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  @IsOptional()
  public avatar?: string;

  @IsEnum(accountTypeEnum, { each: true, message: 'accountType must be a valid value: $constraint1'})
  @IsOptional()
  public accountType?: string;

  @IsString()
  @ValidateIf(o => o.accountType === 'organization' )
  public organization?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  public permission: PermissionDto[];

}

export class EmailDto {
  @IsString()
  public email: string;
}
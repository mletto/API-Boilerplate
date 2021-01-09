import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export class EmailDto {
  @IsString()
  public email: string;
}

export class GoogleTokensDto {
  @IsString()
  public access_token: string;

  @IsString()
  public id_token: string;
}


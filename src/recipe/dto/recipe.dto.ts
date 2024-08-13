// src/recipe/dto/recipe.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsUrl, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';

class IngredientDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  measure?: string;
}

export class RecipeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @IsOptional()
  @IsUrl()
  source?: string;

  @IsOptional()
  @IsUrl()
  imageSource?: string;

  @IsOptional()
  @IsString()
  creativeCommonsConfirmed?: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @IsOptional()
  @IsDateString()
  deleted_at?: string;
}
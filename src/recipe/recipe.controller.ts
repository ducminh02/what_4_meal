import {Controller, Get, Query} from '@nestjs/common';
import {RecipeService} from "./recipe.service";

@Controller('recipe')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @Get()
  findAll(@Query('ingredient') ingredient?: string) {
    return this.recipeService.findAll(ingredient)
  }
}

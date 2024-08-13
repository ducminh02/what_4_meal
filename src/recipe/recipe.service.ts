import { Injectable, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import axios from 'axios';

@Injectable()
export class RecipeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createRecipeDto: Prisma.RecipeCreateInput) {
    return this.databaseService.recipe.create({
      data: createRecipeDto,
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
  }

  async findAll(@Query('ingredient') ingredient?: string) {
    if (ingredient) {
      return this.databaseService.recipe.findMany({
        where: {
          ingredients: {
            some: {
              ingredient: {
                name: {
                  contains: ingredient,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        include: {
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      });
    }
    return this.databaseService.recipe.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.databaseService.recipe.findUnique({
      where: {
        id,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
  }

  private async fetchMealsByIngredient(ingredient: string): Promise<any[]> {
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
    const response = await axios.get(apiUrl);
    return response.data.meals || [];
  }

  private async fetchMealDetails(idMeal: string): Promise<any> {
    const mealDetailUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;
    const response = await axios.get(mealDetailUrl);
    return response.data.meals[0]; // Assuming the API returns a single meal in an array
  }

  private mapMealToCreateRecipeDto(mealDetails: any): {
    instructions: any;
    imageSource: any;
    youtubeUrl: any;
    name: any;
    ingredients: { create: any[] };
    source: any;
    tags: any
  } {
    const ingredients = [];

    // Loop through the potential 20 ingredients and measures
    for (let i = 1; i <= 20; i++) {
      const ingredientName = mealDetails[`strIngredient${i}`]?.trim();
      const measure = mealDetails[`strMeasure${i}`]?.trim();

      if (ingredientName) {
        ingredients.push({
          ingredient: {
            connectOrCreate: {
              where: { name: ingredientName.toLowerCase() },
              create: { name: ingredientName.toLowerCase() },
            },
          },
          measure: measure || null, // Assign measure if available, otherwise null
        });
      }
    }

    return {
      name: mealDetails.strMeal,
      source: mealDetails.strSource || null,
      imageSource: mealDetails.strMealThumb || null,
      instructions: mealDetails.strInstructions || null,
      tags: mealDetails.strTags ? mealDetails.strTags.split(',') : [],
      youtubeUrl: mealDetails.strYoutube || null,
      ingredients: {
        create: ingredients,
      },
    };
  }


  private async saveRecipeToDatabase(createRecipeDto: Prisma.RecipeCreateInput) {
    return this.databaseService.recipe.create({
      data: createRecipeDto,
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  }

  public async fetchAndSaveRecipes(ingredient: string): Promise<any[]> {
    try {
      const meals = await this.fetchMealsByIngredient(ingredient);
      if (meals.length === 0) {
        return []; // No meals found for the ingredient
      }

      const savedRecipes = [];

      for (const meal of meals) {
        const mealDetails = await this.fetchMealDetails(meal.idMeal);
        const createRecipeDto = this.mapMealToCreateRecipeDto(mealDetails);
        const savedRecipe = await this.saveRecipeToDatabase(createRecipeDto);
        savedRecipes.push(savedRecipe);
      }

      return savedRecipes;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw new Error('Unable to fetch recipes from external API');
    }
  }


  async update(id: number, updateRecipeDto: Prisma.RecipeUpdateInput) {
    return this.databaseService.recipe.update({
      where: { id },
      data: updateRecipeDto,
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    return this.databaseService.recipe.delete({
      where: { id }
    });
  }
}

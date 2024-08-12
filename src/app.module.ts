import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './recipe/recipe.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [RecipeModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

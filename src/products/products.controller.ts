import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  public async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  public async findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return await this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  public async findOne(@Param('term') term: string) {
    return await this.productsService.findOne(term);
  }

  @Patch(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}

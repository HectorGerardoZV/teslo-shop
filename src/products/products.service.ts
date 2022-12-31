import { BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) { }
  public async create(createProductDto: CreateProductDto) {
    try {
      if (createProductDto.tags) {
        createProductDto.tags = Array.from(new Set(createProductDto.tags))
          .map(tag => tag.toLowerCase().trim());
      }
      const product = this.productsRepository.create({ ...createProductDto, images: createProductDto.images.map(image => this.productImagesRepository.create({ url: image })) });
      const newProduct = await this.productsRepository.save(product);
      return newProduct;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  public async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, offset } = paginationDto;
      const products = await this.productsRepository.find({
        take: limit,
        skip: Number(offset * limit),
        relations: {
          images: true
        }
      });
      return products.map(product => ({ ...product, images: product.images.map(image => image.url) }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  public async findOne(term: string) {
    try {
      let product: Product;
      if (isUUID(term)) {
        product = await this.productsRepository.findOne({ where: { id: term } });
      } else {
        const query = this.productsRepository.createQueryBuilder('product');
        product = await query.where('LOWER(title)= :title OR slug =:slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase()
        })
          .leftJoinAndSelect('product.images', 'images')
          .getOne();
      }
      return { ...product, images: product.images.map(image => image.url) };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  public async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productsRepository.preload({ id, ...toUpdate });
    if (!product) throw new NotFoundException('This product doesn\'t exist');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImagesRepository.create({ url: image }));
      } else {
        //SOME
      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  public async remove(id: string) {
    try {
      const product = await this.productsRepository.findOne({ where: { id } });
      if (!product) throw new NotFoundException(`Error the product with id ${id} doesn't exist`);
      await this.productsRepository.remove(product);
      return { msg: `The poduct ${product.title} was deleted successfully` };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    const { code } = error;
    console.log(error);
    if (code === '23505') throw new BadRequestException(error.detail)
    else {
      this.logger.error(error.detail);
      throw new InternalServerErrorException('Error: check the console')
    }
  }

}

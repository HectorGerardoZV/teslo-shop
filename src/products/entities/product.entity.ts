import { AfterInsert, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false
    })
    title: string;

    @Column('float', {
        nullable: false
    })
    price: number;

    @Column('text', {
        nullable: true
    })
    description: string;

    @Column('text', {
        nullable: false,
        unique: true
    })
    slug: string;

    @Column('integer', {
        default: 0,
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text', {
        nullable: true
    })
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    @OneToMany(() =>
        ProductImage,
        productImage => productImage.product,
        { cascade: true, eager:true, }
    )
    images?: ProductImage[];

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}

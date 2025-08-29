import { Producer } from "../producers/producer.entity";
import { PropertyCrop } from "../property-crops/property-crop.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'properties' })
export class Property {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Producer, p => p.properties, { eager: false })
    @JoinColumn({ name: 'producer_id' })
    producer: Producer;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 100 })
    state: string;

    @Column({ name: 'total_area_ha', type: 'numeric', precision: 12, scale: 2 })
    totalAreaHa: string;

    @Column({ name: 'arable_area_ha', type: 'numeric', precision: 12, scale: 2 })
    arableAreaHa: string;

    @Column({ name: 'vegetation_area_ha', type: 'numeric', precision: 12, scale: 2 })
    vegetationAreaHa: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    cep?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    complement?: string | null;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    latitude?: string | null;

    @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
    longitude?: string | null;

    @OneToMany(() => PropertyCrop, pc => pc.property)
    propertyCrops: PropertyCrop[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null;
}
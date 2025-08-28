import { PropertyCrop } from '../property-crops/property-crop.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'crop' })
export class Crop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    name: string;

    @OneToMany(() => PropertyCrop, (propertyCrop) => propertyCrop.crop)
    propertyCrops: PropertyCrop[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

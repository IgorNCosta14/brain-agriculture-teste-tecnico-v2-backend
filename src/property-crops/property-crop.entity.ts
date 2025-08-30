import { Crop } from "../crops/crop.entity";
import { Harvest } from "../harvests/harvest.entity";
import { Property } from "../properties/property.entity";
import { CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'property_crop' })
export class PropertyCrop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Property, p => p.propertyCrops)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @ManyToOne(() => Harvest, h => h.propertyCrops)
    @JoinColumn({ name: 'harvest_id' })
    harvest: Harvest;

    @ManyToOne(() => Crop, c => c.propertyCrops)
    @JoinColumn({ name: 'crop_id' })
    crop: Crop;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null;
}
import { Crop } from "../crops/crop.entity";
import { Harvest } from "../harvests/harvest.entity";
import { Property } from "../properties/property.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Unique('uq_property_harvest_crop', ['propertyId', 'harvestId', 'cropId'])
@Entity({ name: 'property_crop' })
export class PropertyCrop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Property, p => p.propertyCrops)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @Column({ name: 'property_id' })
    propertyId: string;

    @ManyToOne(() => Harvest, h => h.propertyCrops)
    @JoinColumn({ name: 'harvest_id' })
    harvest: Harvest;

    @Column({ name: 'harvest_id' })
    harvestId: string;

    @ManyToOne(() => Crop, c => c.propertyCrops)
    @JoinColumn({ name: 'crop_id' })
    crop: Crop;

    @Column({ name: 'crop_id' })
    cropId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
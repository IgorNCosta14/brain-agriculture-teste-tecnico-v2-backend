import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { DocumentType } from "../shared/enums/document-type.enum"
import { Property } from "src/properties/property.entity";

@Entity('producers')
export class Producer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: DocumentType,
        enumName: 'document_type_enum',
        name: 'document_type'
    })
    documentType: DocumentType

    @Column({ name: 'document', length: 14 })
    document: string;

    @Column({ name: 'name', length: 150 })
    name: string;

    @OneToMany(() => Property, p => p.producer)
    properties: Property[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'varchar', name: 'deleted_at' })
    deleted_at: Date;
}
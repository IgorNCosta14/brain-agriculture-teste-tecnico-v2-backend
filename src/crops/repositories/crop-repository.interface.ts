import { Crop } from "../crop.entity";

export interface ICropRepository {
    createCrop(name: string): Promise<Crop>;
    findByName(name: string): Promise<Crop | null>;
    findById(id: string): Promise<Crop | null>;
    findAll(): Promise<Crop[]>;
}
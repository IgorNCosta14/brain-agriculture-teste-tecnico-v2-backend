import { Producer } from "src/producers/producer.entity";

export interface CreatePropertyDto {
    producer: Producer;
    name: string;
    city: string;
    state: string
    totalAreaHa: string;
    arableAreaHa: string;
    vegetationAreaHa: string;
    complement?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    cep?: string | null;
}
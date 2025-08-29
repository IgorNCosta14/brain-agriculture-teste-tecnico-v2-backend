export interface CreatePropertyServiceDto {
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalAreaHa: string;
    arableAreaHa: string;
    vegetationAreaHa: string;
    complement?: string;
    latitude?: string;
    longitude?: string;
    cep?: string;
}
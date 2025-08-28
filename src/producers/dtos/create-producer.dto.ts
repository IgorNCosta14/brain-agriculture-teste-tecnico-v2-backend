import { DocumentType } from '../../shared/enums/document-type.enum'

export interface CreateProducerDto {
    documentType: DocumentType,
    document: string,
    name: string
}
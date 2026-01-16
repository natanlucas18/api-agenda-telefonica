import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class PaginationQueryDto {
    @ApiProperty({
        example: 1,
        description: 'número da página'
    })
    page: number = 1;

    @ApiProperty({
        example: 10,
        description: 'quantidade de itens'
    })
    limit: number = 10;

    @ApiProperty({
        example: 'natan',
        description: 'filtro de busca'
    })
    search?: string;

    @ApiProperty({
        example: 'id',
        description: 'ordenar por um campo específico'
    })
    sortBy?: string;

    @ApiProperty({
        example: 'ASC',
        description: 'ordernação do maior para o menor ou vice-versa'
    })
    sortOrder?: 'ASC' | 'DESC';
}
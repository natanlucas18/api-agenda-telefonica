export class PaginationQueryDto {
    page: number = 1;
    limit: number = 10;
    search?: string;
    sortBy?: string = 'id';
    sortOrder: 'ASC' | 'DESC' = 'ASC'
}
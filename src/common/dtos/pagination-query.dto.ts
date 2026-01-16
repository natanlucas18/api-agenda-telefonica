import { IsIn } from "class-validator";

export class PaginationQueryDto {
    page: number = 1;
    limit: number = 10;
    search?: string;
    sortBy?: string;

    sortOrder?: 'ASC' | 'DESC';
}
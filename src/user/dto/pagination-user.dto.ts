export class PaginationUserDto {
    page: number;
    pageSize: number;
    search?: string;
    roles?: string;
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

export class PaginationFollowUserDto {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}
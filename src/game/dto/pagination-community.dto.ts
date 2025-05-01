
export class PaginationCommunityDto {
    page: number;
    pageSize: number;
    search?: string;
    categories?: string[];
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

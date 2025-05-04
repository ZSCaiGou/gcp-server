import { UserContentType } from "src/common/entity/user_content.entity";

export class ModPaginationCommunityContentDto {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    type: UserContentType | undefined;
}
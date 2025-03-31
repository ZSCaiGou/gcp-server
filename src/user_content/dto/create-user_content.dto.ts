import { UserContentType } from 'src/common/entity/user_content.entity';

export class CreateUserContentDto {
    title: string;
    content: string;
    type: UserContentType;
    game_ids: string[];
    topic_ids?: string[];
    cover_url?: string;
    picture_urls?: string[];
}

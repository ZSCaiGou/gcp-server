import { UserProfile } from './../entity/user_profile.entity';
import { UserContent } from 'src/common/entity/user_content.entity';

import { Topic } from './../entity/topic.entity';
import { TaskReward } from './../entity/task_reward.entity';
import { SupportTicket } from './../entity/support_ticket.entity';
import { Role } from './../entity/role.entity';
import { Resource } from './../entity/resource.entity';
import { Notification } from './../entity/notification.entity';
import { Interaction } from './../entity/interaction.entity';
import { Game } from './../entity/game.entity';
import { User } from '../entity/user.entity';
import { Feedback } from '../entity/feedback.entity';

export interface ResourceMap {
    User: User;
    Comment: Comment;
    Feedback: Feedback;
    Game: Game;
    Interaction: Interaction;
    Notification: Notification;
    Resource: Resource;
    Role: Role;
    SupportTicket: SupportTicket;
    TaskReward: TaskReward;
    Topic: Topic;
    UserContent: UserContent;
    UserProfile: UserProfile;
    ALL: any;
}

export interface CategoryGameList{
    [key:string]:Game[]
}
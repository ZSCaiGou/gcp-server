

export const ConfigKey = {
    JWT_SECRET: 'JWT_SECRET',
    JWT_EXPIRE_TIME: 'JWT_EXPIRE_TIME',
    DB_HOST: 'DB_HOST',
    DB_USER: 'DB_USER',
    DB_PASSWORD: 'DB_PASSWORD',
    DB_DATABASE: 'DB_DATABASE',
    DB_NAME: 'DB_NAME',
    DB_PORT: 'DB_PORT',
    DB_SYNC: 'DB_SYNC',
    REDIS_HOST: 'REDIS_HOST',
    REDIS_PORT: 'REDIS_PORT',
    REDIS_URL: 'REDIS_URL',
};

export const MessageConstant = {
    PASSWORD_ERROR: '密码错误',
    USER_NOT_EXIST: '用户不存在',
    CODE_ERROR: '验证码错误',
    ILLEGAL_VALUE: '非法值',
    SUCCESS: '成功',
    USER_DISABLED: '用户被禁用',
    USER_ALREADY_EXIST: '用户已存在',
    USER_NOT_LOGIN: '用户未登录',
    USERNAME_ALREADY_EXIST: '用户名已存在',
    EMAIL_ALREADY_EXIST: '邮箱已存在',
    PHONE_ALREADY_EXIST: '手机号已存在',
    VERIFY_CODE_SEND_SUCCESS: '验证码发送成功',
    USER_CONTENT_NOT_FOUND: '用户内容不存在',
    USER_CONTENT_ALREADY_EXIST: '用户内容已存在',
    USER_CONTENT_NOT_OWNER: '不是该用户内容的拥有者',
    USER_CONTENT_NOT_APPROVED: '用户内容未通过审核',
    USER_CONTENT_NOT_PUBLIC: '用户内容未公开',
    TOPIC_NOT_FOUND: '话题不存在',
    TOPIC_ALREADY_EXIST: '话题已存在',
    TOPIC_NOT_OWNER: '不是该话题的拥有者',
    TOPIC_NOT_APPROVED: '话题未通过审核',
    TOPIC_NOT_PUBLIC: '话题未公开',
    COMMENT_NOT_FOUND: '评论不存在',
    COMMENT_ALREADY_EXIST: '评论已存在',
    COMMENT_NOT_OWNER: '不是该评论的拥有者',
    COMMENT_NOT_APPROVED: '评论未通过审核',
    COMMENT_NOT_PUBLIC: '评论未公开',
    LIKE_ALREADY_EXIST: '已点赞',
    REWARD_NOT_FOUND: '奖励不存在',
    REWARD_ALREADY_EXIST: '奖励已存在',
    REWARD_NOT_OWNER: '不是该奖励的拥有者',
    REWARD_NOT_APPROVED: '奖励未通过审核',
    COLLECT_ALREADY_EXIST: '已收藏',
}

export enum AbilityAction {
    MANAGE = 'MANAGE',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    READ = 'READ',
    COMMENT = 'COMMENT',
    DOWNLOAD = 'DOWNLOAD',
}
export enum AbilityResource {
    User='User',
    Comment='Comment',
    Feedback='Feedback',
    Game='Game',
    Interaction='Interaction',
    MfaSetting='MfaSetting',
    Notification='Notification',
    Permission='Permission',
    Resource='Resource',
    Role='Role',
    SupportTicket='SupportTicket',
    TaskReward='TaskReward',
    Topic='Topic',
    UserAuth='UserAuth',
    UserContent='UserContent',
    UserProfile='UserProfile',
    ALL='ALL',
}


export enum ExpPoint{
    EXP_POINT_UPLOAD_CONTENT = 10, // 上传内容
    EXP_POINT_COMMENT_CONTENT = 2, // 评论内容
    EXP_POINT_LOGIN = 10, // 登录
}

export const IS_PUBLIC_KEY = 'isPublic';
export const DEFAULT_AVATAR_URL = "https://gcpserver.oss-cn-chengdu.aliyuncs.com/avatar/default.png?x-oss-process=style/image-compress"
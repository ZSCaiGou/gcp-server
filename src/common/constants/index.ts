

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
};

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


export const IS_PUBLIC_KEY = 'isPublic';
export const DEFAULT_AVATAR_URL = "https://gcpserver.oss-cn-chengdu.aliyuncs.com/avatar/default.png?x-oss-process=style/image-compress"
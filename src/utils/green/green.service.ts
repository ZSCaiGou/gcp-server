import { Injectable } from '@nestjs/common';
import Green20220302, * as $Green20220302 from '@alicloud/green20220302';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class GreenService {
    private readonly greenClient: any;
    constructor(private readonly configService: ConfigService) {
        const config = new $OpenApi.Config({
            accessKeyId: this.configService.get<string>('GREEN_ACCESS_KEY_ID'),
            accessKeySecret: this.configService.get<string>(
                'GREEN_ACCESS_KEY_SECRET',
            ),
            endpoint: this.configService.get<string>('GREEN_ENDPOINT'),
        });

        this.greenClient = new Green20220302(config);
    }

    async contentScan(content: string): Promise<any> {
        let textModerationRequest = new $Green20220302.TextModerationRequest({
            service: 'comment_detection',
            serviceParameters: JSON.stringify({content: content}),
        });
        let runtime = new $Util.RuntimeOptions({});
        try {
            // 复制代码运行请自行打印 API 的返回值
            const result = await this.greenClient.textModerationWithOptions(
                textModerationRequest,
                runtime,
            );
            return result;
        } catch (error) {
            // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
            // 错误 message
            console.log(error.message);
            
        }
    }
}

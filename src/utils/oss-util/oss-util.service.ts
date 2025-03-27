import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const OSS = require('ali-oss');
@Injectable()
export class OssUtilService {
    private ossClient;

    constructor(private configService: ConfigService) {
        const keyId = this.configService.get<string>('OSS_ACCESS_KEY_ID');
        const keySecret = this.configService.get<string>(
            'OSS_ACCESS_KEY_SECRET',
        );
        const endpoint = this.configService.get<string>('OSS_ENDPOINT');
        const bucket = this.configService.get<string>('OSS_BUCKET');
        const region = this.configService.get<string>('OSS_REGION');
        if (keyId && keySecret && endpoint && bucket) {
            this.ossClient = new OSS({
                accessKeyId: keyId,
                accessKeySecret: keySecret,
                bucket: bucket,
                region: region,
            });
        }
    }

    async test() {
        try {
            const result = await this.ossClient.get("one.jpeg");
            console.log(result);
        } catch (err) {
            console.log(err);
        }
        
    }
}

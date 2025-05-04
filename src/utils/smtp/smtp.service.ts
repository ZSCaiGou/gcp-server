import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
    private transporter;

    constructor(private configService: ConfigService) {
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpPort = this.configService.get<number>('SMTP_PORT');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
        if (smtpHost && smtpPort && smtpUser && smtpPassword) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: true,
                auth: {
                    user: smtpUser,
                    pass: smtpPassword,
                },
            });
        }
    }

    async sendEmail(to: string, subject: string, text: string) {
        if (!this.transporter) {
            throw new Error('smtp transporter not init');
        }
        const info = await this.transporter.sendMail({
            from:
                'GAMECP' +
                '<' +
                this.configService.get<string>('SMTP_USER') +
                '>',
            to: to,
            subject: subject,
            text: text,
        });
        return info;
    }
}

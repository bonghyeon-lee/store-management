import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotificationType } from '../models/notification.model';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@store-management.com',
        to,
        subject,
        text: content,
        html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
      });
      this.logger.log(`이메일 발송 성공: ${to}`);
    } catch (error: any) {
      this.logger.error(`이메일 발송 실패: ${to}`, error.stack);
      throw error;
    }
  }

  async sendNotification(
    type: NotificationType,
    recipient: string,
    subject: string,
    content: string,
  ): Promise<void> {
    if (type === NotificationType.EMAIL) {
      await this.sendEmail(recipient, subject, content);
    } else {
      // SMS, SLACK 등은 MVP 단계에서 미구현
      this.logger.warn(`미구현 알림 타입: ${type}`);
    }
  }
}

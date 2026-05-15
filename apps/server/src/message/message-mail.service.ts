import { Injectable, Logger } from '@nestjs/common'
import nodemailer from 'nodemailer'
import type { MessageDocument } from './schema/message.schema'

@Injectable()
export class MessageMailService {
  private readonly logger = new Logger(MessageMailService.name)

  private get mailHost() {
    return process.env.MAIL_HOST?.trim() || ''
  }

  private get mailPort() {
    return Number(process.env.MAIL_PORT || 0)
  }

  private get mailSecure() {
    return String(process.env.MAIL_SECURE || '').toLowerCase() === 'true'
  }

  private get mailUser() {
    return process.env.MAIL_USER?.trim() || ''
  }

  private get mailPass() {
    return process.env.MAIL_PASS?.trim() || ''
  }

  private get mailFrom() {
    return process.env.MAIL_FROM?.trim() || this.mailUser
  }

  private get mailEnabled() {
    return Boolean(this.mailHost && this.mailPort && this.mailUser && this.mailPass && this.mailFrom)
  }

  private createTransporter() {
    return nodemailer.createTransport({
      host: this.mailHost,
      port: this.mailPort,
      secure: this.mailSecure,
      auth: {
        user: this.mailUser,
        pass: this.mailPass,
      },
    })
  }

  async sendAdminReplyNotice(parent: MessageDocument | Record<string, any>, reply: MessageDocument | Record<string, any>) {
    const targetEmail = typeof parent.email === 'string' ? parent.email.trim() : ''
    //没有邮箱或未勾选邮箱通知，不发送通知
    if (!targetEmail || !parent.enableEmailNotice) {
      return
    }
    // 检查邮件环境变量是否配置完整
    if (!this.mailEnabled) {
      this.logger.warn('检测到留言已勾选邮箱通知，但未完整配置邮件环境变量，已跳过发送')
      return
    }

    const transporter = this.createTransporter()
    const subject = 'CoBlog 留言回复通知'
    const text = [
      '你好，您在 CoBlog 的留言收到了新的回复。',
      '',
      '原留言：',
      String(parent.content || ''),
      '',
      '站长回复：',
      String(reply.content || ''),
      '',
      '访问站点：',
      'https://coblog.top/message',
    ].join('\n')

    const html = `
      <div style="font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.8; color: #111827;">
        <p>你好，您在 <strong>CoBlog</strong> 的留言收到了新的回复。</p>
        <p><strong>原留言：</strong><br />${String(parent.content || '').replace(/\n/g, '<br />')}</p>
        <p><strong>站长回复：</strong><br />${String(reply.content || '').replace(/\n/g, '<br />')}</p>
        <p><strong>访问站点：</strong><br /><a href="https://coblog.top/message">https://coblog.top/message</a></p>
      </div>
    `

    try {
      await transporter.sendMail({
        from: this.mailFrom,
        to: targetEmail,
        subject,
        text,
        html,
      })
    } catch (error) {
      this.logger.error(`回复通知邮件发送失败: ${targetEmail}`, error instanceof Error ? error.stack : undefined)
    }
  }
}

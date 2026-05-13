import { BadRequestException, Injectable } from '@nestjs/common'
import {InjectModel} from '@nestjs/mongoose'
import {Message,MessageDocument} from './schema/message.schema'
import {Model, Types} from 'mongoose'
import {CreateMessageDto} from './dto/create-message.dto'
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto'
import { Subject } from 'rxjs'
import { normalizeLocation } from '../common/utils/normalize-location'

@Injectable()
export class MessageService {
    private readonly stream$ = new Subject<{ type: string; data?: unknown }>()

    constructor(@InjectModel(Message.name) private readonly messageModel:Model<MessageDocument>){}

    private serialize(message: Record<string, any> | null) {
      if (!message) {
        return message
      }

      return {
        ...message,
        id: String(message._id),
        _id: undefined,
        createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : message.createdAt,
        updatedAt: message.updatedAt ? new Date(message.updatedAt).toISOString() : message.updatedAt,
        reviewedAt: message.reviewedAt ? new Date(message.reviewedAt).toISOString() : message.reviewedAt,
      }
    }

    // SSE 订阅源。
    stream() {
      return this.stream$.asObservable()
    }

    // 公开页：只返回已通过的留言。
    async findAllApproved(){
      const messages = await this.messageModel.find({ status: 'approved' }).sort({ createdAt: -1 }).lean()
      return messages.map((item) => this.serialize(item))
    }

    // 当前 senderId 自己的 pending / rejected 留言。
    async findMine(senderId: string){
      const messages = await this.messageModel.find({ senderId, status: { $in: ['pending', 'rejected'] } }).sort({ createdAt: -1 }).lean()
      return messages.map((item) => this.serialize(item))
    }

    // admin 完整管理列表。
    async findAllAdmin(){
      const messages = await this.messageModel.find().sort({ createdAt: -1 }).lean()
      return messages.map((item) => this.serialize(item))
    }

    // admin 角标数量。
    async pendingCount(){
      return this.messageModel.countDocuments({ status: 'pending' })
    }

    // 创建留言时：按 senderId 限制 pending 数量，直接使用前端传来的 location。
    async create(createMessageDto:CreateMessageDto, ip: string){
      const pendingCount = await this.messageModel.countDocuments({
        senderId: createMessageDto.senderId,
        status: 'pending',
      })
      if (pendingCount >= 3) {
        throw new BadRequestException('待审核留言过多，请稍后再试')
      }

      const location = normalizeLocation(createMessageDto.location)
      const { parentId = '', ...messagePayload } = createMessageDto

      // parentId 存在时，沿用根节点并挂到目标留言下面，前台就能还原楼中楼结构。
      if (parentId) {
        const parent = await this.messageModel.findById(parentId).lean()
        if (!parent) {
          throw new BadRequestException('回复目标不存在')
        }

        const id = new Types.ObjectId()
        const message = await this.messageModel.create({
          _id: id,
          ...messagePayload,
          ip,
          rootId: parent.rootId,
          parentId: parent._id.toString(),
          authorType: 'visitor',
          replyToAuthor: parent.author,
          status: 'pending',
          location,
        })

        this.stream$.next({ type: 'created', data: { pendingCount: pendingCount + 1 } })
        return this.serialize(message.toObject())
      }

      const id = new Types.ObjectId()
      const message = await this.messageModel.create({
        _id: id,
        ...messagePayload,
        ip,
        rootId: id.toString(),
        parentId: '',
        authorType: 'visitor',
        replyToAuthor: '',
        status: 'pending',
        location,
      })

      this.stream$.next({ type: 'created', data: { pendingCount: pendingCount + 1 } })
      return this.serialize(message.toObject())
    }

    async createAdminReply(parentId: string, dto: CreateAdminReplyDto, ip: string) {
      const parent = await this.messageModel.findById(parentId).lean()
      if (!parent) {
        throw new BadRequestException('父留言不存在')
      }

      const location = normalizeLocation(dto.location)
      const id = new Types.ObjectId()
      const message = await this.messageModel.create({
        _id: id,
        author: dto.author,
        content: dto.content,
        email: '',
        qq: '',
        senderId: 'admin',
        ip,
        rootId: parent.rootId,
        parentId: parent._id.toString(),
        authorType: 'admin',
        replyToAuthor: parent.author,
        location,
        device: dto.device,
        browser: dto.browser,
        enableEmailNotice: false,
        status: 'approved',
        reviewedAt: new Date(),
      })

      const pendingCount = await this.pendingCount()
      this.stream$.next({ type: 'admin-replied', data: { pendingCount } })
      return this.serialize(message.toObject())
    }

    // 审核通过。
    async approve(id: string) {
      const message = await this.messageModel.findByIdAndUpdate(
        id,
        { status: 'approved', reviewedAt: new Date() },
        { new: true },
      ).lean()
      const pendingCount = await this.pendingCount()
      this.stream$.next({ type: 'updated', data: { id, status: 'approved', pendingCount } })
      return message ? this.serialize(message) : null
    }

    // 审核拒绝。
    async reject(id: string) {
      const message = await this.messageModel.findByIdAndUpdate(
        id,
        { status: 'rejected', reviewedAt: new Date() },
        { new: true },
      ).lean()
      const pendingCount = await this.pendingCount()
      this.stream$.next({ type: 'updated', data: { id, status: 'rejected', pendingCount } })
      return message ? this.serialize(message) : null
    }

    // 删除留言。
    async remove(id: string) {
      const message = await this.messageModel.findByIdAndDelete(id).lean()
      const pendingCount = await this.pendingCount()
      this.stream$.next({ type: 'deleted', data: { id, pendingCount } })
      return message ? this.serialize(message) : null
    }
}

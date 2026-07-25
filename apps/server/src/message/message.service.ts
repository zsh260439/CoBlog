import { BadRequestException, Injectable, OnModuleDestroy } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { concatWith, from, Observable, Subject } from 'rxjs'
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessageMailService } from './message-mail.service'
import { Message, MessageDocument } from './schema/message.schema'
import { isMainlandLocation, normalizeLocation } from '../common/utils/normalize-location'

type MessageStatus = 'pending' | 'approved' | 'rejected'
type StreamAction = 'created' | 'updated' | 'deleted' | 'admin-replied' | 'ping'

interface StreamPayload {
  action: StreamAction
  message?: Record<string, unknown> | null
  messageId?: string
  status?: MessageStatus
  pendingCount?: number
}

interface StreamEvent {
  id: string
  retry: number
  data: StreamPayload
}

type MessageRecord = Record<string, unknown> & {
  _id?: unknown
  location?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  reviewedAt?: Date | string
}

@Injectable()
export class MessageService implements OnModuleDestroy {
  private readonly stream$ = new Subject<StreamEvent>()
  private readonly streamHistory: StreamEvent[] = []
  private streamId = 0
  private readonly heartbeatTimer: NodeJS.Timeout

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly messageMailService: MessageMailService,
  ) {
    this.heartbeatTimer = setInterval(() => {
      this.publish({
        action: 'ping',
      })
    }, 20000)
  }

  onModuleDestroy() {
    clearInterval(this.heartbeatTimer)
    this.stream$.complete()
  }

  private serialize(message: MessageRecord | null) {
    if (!message) {
      return message
    }

    const location = normalizeLocation((message.location as string) || '')

    return {
      ...message,
      id: String(message._id),
      _id: undefined,
      location: isMainlandLocation(location) ? location : '',
      createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : message.createdAt,
      updatedAt: message.updatedAt ? new Date(message.updatedAt).toISOString() : message.updatedAt,
      reviewedAt: message.reviewedAt ? new Date(message.reviewedAt).toISOString() : message.reviewedAt,
    }
  }

  private publish(payload: StreamPayload) {
    const event: StreamEvent = {
      id: String(++this.streamId),
      retry: 3000,
      data: payload,
    }

    this.streamHistory.push(event)
    if (this.streamHistory.length > 100) {
      this.streamHistory.shift()
    }

    this.stream$.next(event)
  }

  private buildStream(lastEventId?: string): Observable<StreamEvent> {
    const lastId = lastEventId ? Number(lastEventId) : Number.NaN
    const replayEvents = Number.isFinite(lastId)
      ? this.streamHistory.filter((item) => Number(item.id) > lastId)
      : []

    return from(replayEvents).pipe(concatWith(this.stream$.asObservable()))
  }

  stream(lastEventId?: string) {
    return this.buildStream(lastEventId)
  }

  async findAllApproved() {
    const messages = await this.messageModel.find({ status: 'approved' }).sort({ createdAt: -1 }).lean()
    return messages.map((item) => this.serialize(item as MessageRecord))
  }

  async findMine(visitorId: string) {
    if (!visitorId) {
      return []
    }

    const messages = await this.messageModel
      .find({ senderId: visitorId, status: { $in: ['pending', 'rejected'] } })
      .sort({ createdAt: -1 })
      .lean()

    return messages.map((item) => this.serialize(item as MessageRecord))
  }

  async findAllAdmin() {
    const messages = await this.messageModel.find().sort({ createdAt: -1 }).lean()
    return messages.map((item) => this.serialize(item as MessageRecord))
  }

  async pendingCount() {
    return this.messageModel.countDocuments({ status: 'pending' })
  }

  async create(createMessageDto: CreateMessageDto, ip: string, visitorId: string) {
    if (!visitorId) {
      throw new BadRequestException('访客标识缺失')
    }

    const pendingCount = await this.messageModel.countDocuments({
      senderId: visitorId,
      status: 'pending',
    })

    if (pendingCount >= 3) {
      throw new BadRequestException('待审核留言过多，请稍后再试')
    }

    const location = normalizeLocation(createMessageDto.location)
    const { parentId = '', ...messagePayload } = createMessageDto

    if (parentId) {
      const parent = await this.messageModel.findById(parentId).lean()
      if (!parent) {
        throw new BadRequestException('回复目标不存在')
      }

      const id = new Types.ObjectId()
      const message = await this.messageModel.create({
        _id: id,
        ...messagePayload,
        senderId: visitorId,
        ip,
        rootId: parent.rootId,
        parentId: parent._id.toString(),
        authorType: 'visitor',
        replyToAuthor: parent.author,
        status: 'pending',
        location,
      })

      const serialized = this.serialize(message.toObject() as unknown as MessageRecord)
      this.publish({
        action: 'created',
        message: serialized,
        pendingCount: pendingCount + 1,
      })
      return serialized
    }

    const id = new Types.ObjectId()
    const message = await this.messageModel.create({
      _id: id,
      ...messagePayload,
      senderId: visitorId,
      ip,
      rootId: id.toString(),
      parentId: '',
      authorType: 'visitor',
      replyToAuthor: '',
      status: 'pending',
      location,
    })

    const serialized = this.serialize(message.toObject() as unknown as MessageRecord)
    this.publish({
      action: 'created',
      message: serialized,
      pendingCount: pendingCount + 1,
    })
    return serialized
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

    await this.messageMailService.sendAdminReplyNotice(parent, message.toObject())

    const serialized = this.serialize(message.toObject() as unknown as MessageRecord)
    const pendingCount = await this.pendingCount()
    this.publish({
      action: 'admin-replied',
      message: serialized,
      pendingCount,
    })
    return serialized
  }

  async approve(id: string) {
    const message = await this.messageModel
      .findByIdAndUpdate(id, { status: 'approved', reviewedAt: new Date() }, { new: true })
      .lean()

    const pendingCount = await this.pendingCount()
    this.publish({
      action: 'updated',
      message: message ? this.serialize(message as MessageRecord) : null,
      status: 'approved',
      pendingCount,
    })
    return message ? this.serialize(message as MessageRecord) : null
  }

  async reject(id: string) {
    const message = await this.messageModel
      .findByIdAndUpdate(id, { status: 'rejected', reviewedAt: new Date() }, { new: true })
      .lean()

    const pendingCount = await this.pendingCount()
    this.publish({
      action: 'updated',
      message: message ? this.serialize(message as MessageRecord) : null,
      status: 'rejected',
      pendingCount,
    })
    return message ? this.serialize(message as MessageRecord) : null
  }

  async remove(id: string) {
    const message = await this.messageModel.findByIdAndDelete(id).lean()
    const pendingCount = await this.pendingCount()
    this.publish({
      action: 'deleted',
      message: message ? this.serialize(message as MessageRecord) : null,
      messageId: id,
      pendingCount,
    })
    return message ? this.serialize(message as MessageRecord) : null
  }
}

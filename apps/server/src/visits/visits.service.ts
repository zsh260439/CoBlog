import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Visit, VisitDocument } from './schema/visit.schema'
import { TrackVisitDto } from './dto/track-visit.dto'

const SESSION_TIMEOUT_MS = 5 * 60 * 1000
const ONLINE_WINDOW_MS = 5 * 60 * 1000

@Injectable()
export class VisitsService {
  constructor(@InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>) {}
  // 记录访问
  async track(dto: TrackVisitDto, ip: string, userAgent: string) {
    const now = new Date()
    const sessionStart = new Date(now.getTime() - SESSION_TIMEOUT_MS)

    const existing = await this.visitModel.findOne({
      ip,
      lastActiveAt: { $gte: sessionStart },
    })

    if (existing) {
      await this.visitModel.updateOne(
        { _id: existing._id },
        { $set: { lastActiveAt: now } },
      )
      return { ok: true, counted: false }
    }

    const location = await this.resolveLocation(ip)
    await this.visitModel.create({
      ip,
      userAgent,
      lastPath: dto.path,
      lastActiveAt: now,
      ...(location ? { location } : {}),
    })
    return { ok: true, counted: true }
  }
  // 获取公开统计信息
  async getPublicStats() {
    const now = new Date()
    const todayStart = new Date(now)
    // 重置时间为今天凌晨
    todayStart.setHours(0, 0, 0, 0)
    // 重置时间为5分钟前
    const onlineStart = new Date(now.getTime() - ONLINE_WINDOW_MS)

    const [todayViews, totalViews, totalVisitors, onlineVisitors] = await Promise.all([
      this.visitModel.countDocuments({ createdAt: { $gte: todayStart } }),
      this.visitModel.countDocuments(),
      this.visitModel.distinct('ip').then((items) => items.length),
      this.visitModel.countDocuments({ lastActiveAt: { $gte: onlineStart } }),
    ])

    return {
      onlineUsers: onlineVisitors,
      todayViews,
      totalViews,
      totalVisitors,
    }
  }
  // 获取关于统计信息
  async getAboutStats() {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)

    const trendRaw = await this.visitModel.aggregate<{ _id: { year: number; month: number; day: number }; count: number }>([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    const trendMap = new Map<number, number>()
    trendRaw.forEach((item) => {
      const key = item._id.year * 10000 + item._id.month * 100 + item._id.day
      trendMap.set(key, item.count)
    })

    let cumulative = 0
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
      cumulative += trendMap.get(key) ?? 0
      return {
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        value: cumulative,
      }
    })

    const citiesRaw = await this.visitModel.aggregate<{ _id: string; count: number }>([
      { $match: { location: { $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ])

    const cities = citiesRaw.map((item) => ({
      label: item._id,
      value: item.count,
    }))

    return { trend, cities }
  }

  private async resolveLocation(ip: string) {
    const normalized = ip.replace('::ffff:', '').trim()
    if (!normalized || normalized === '::1' || normalized === '127.0.0.1') {
      return ''
    }

    try {
      const response = await fetch(`https://ipwho.is/${normalized}`)
      if (!response.ok) return ''

      const data = await response.json() as { success?: boolean; region?: string; city?: string }
      if (data.success === false) return ''

      return [data.region, data.city].filter(Boolean).join(' ')
    } catch {
      return ''
    }
  }
}

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Visit, VisitDocument } from './schema/visit.schema'
import { TrackVisitDto } from './dto/track-visit.dto'

@Injectable()
export class VisitsService {
  constructor(@InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>) {}

  async track(dto: TrackVisitDto, ip: string, userAgent: string) {
    const dedupeStart = new Date(Date.now() - 60 * 1000)
    const recentVisit = await this.visitModel.findOne({
      ip,
      path: dto.path,
      createdAt: { $gte: dedupeStart },
    }).lean()

    if (recentVisit) {
      return { ok: true, skipped: true }
    }

    const location = await this.resolveLocation(ip)
    await this.visitModel.create({
      path: dto.path,
      ip,
      userAgent,
      ...(location ? { location } : {}),
    })
    return { ok: true }
  }

  async getPublicStats() {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const onlineStart = new Date(now.getTime() - 5 * 60 * 1000)

    const [todayViews, totalViews, totalVisitors, onlineVisitors] = await Promise.all([
      this.visitModel.countDocuments({ createdAt: { $gte: todayStart } }),
      this.visitModel.countDocuments(),
      this.visitModel.distinct('ip').then((items) => items.length),
      this.visitModel.distinct('ip', { createdAt: { $gte: onlineStart } }).then((items) => items.length),
    ])

    return {
      onlineUsers: onlineVisitors,
      todayViews,
      totalViews,
      totalVisitors,
    }
  }

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

    const trendMap = new Map<string, number>()
    trendRaw.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
      trendMap.set(key, item.count)
    })

    let cumulative = 0
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

    const response = await fetch(`https://ipwho.is/${normalized}`)
    if (!response.ok) return ''

    const data = await response.json() as { success?: boolean; region?: string; city?: string }
    if (data.success === false) return ''

    return [data.region, data.city].filter(Boolean).join(' ')
  }
}

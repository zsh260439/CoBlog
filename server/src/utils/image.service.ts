import axios from "axios"
import { Injectable } from "@nestjs/common"

@Injectable()
export class ImageService {
   constructor(){}
    async getRandomCoverImage () {
     const data = await axios.get<string>('https://t.alcy.cc/fj',{
        maxRedirects:5
     })
    return data.request?.res?.responseUrl || ''
}
}
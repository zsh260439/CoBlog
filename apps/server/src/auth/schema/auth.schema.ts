import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose';
@Schema({timestamps:true})
export class Login {
    @Prop({
       unique:true,required:true,trim:true
    })
    username: string
    @Prop({
        required:true
    })
    password: string

    @Prop({default:'admin'})
    role:string

    @Prop({default:''})
    refreshToken:string

    @Prop({default:''})
    previousRefreshToken:string

    // Date | null 是联合类型，Mongoose 无法自动推断，必须显式声明 type
    @Prop({ type: Date, default: null })
    refreshTokenRotatedAt?:Date | null
}

export type LoginDocument = HydratedDocument<Login>
export const LoginSchema = SchemaFactory.createForClass(Login)

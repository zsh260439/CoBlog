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
}

export type LoginDocument = HydratedDocument<Login>
export const LoginSchema = SchemaFactory.createForClass(Login)

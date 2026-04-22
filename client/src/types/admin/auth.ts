export interface LoginPayload {
  username: string
  password: string
}
export interface LoginResult {
    accessToken:string
       user:{
           userId:string
          username:string,
          role:string
    }
}

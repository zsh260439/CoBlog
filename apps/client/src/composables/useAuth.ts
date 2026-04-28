import { jwtDecode, JwtPayload } from "jwt-decode"

export const useAuth = ()=>{
     const isAccessTokenExpired = (token:string )=>{
        try {
            const payload = jwtDecode<JwtPayload>(token)

            if(!payload.exp) {
                return true
            }
         return payload.exp *1000 <=Date.now() + 3000
        } catch {
            return true
        }
     }
     return {
        isAccessTokenExpired
     }
}
//防抖实现
export const useDebounce =<T extends (...args:any[])  => void> (fn:T,delay:number) =>{
         let timer:ReturnType<typeof setTimeout> | null = null

         const debouncedFn = (...args:Parameters<T>)=>{
             if(timer){
                 clearTimeout(timer)
             }
             timer = setTimeout(()=>{
                 fn(...args)
                 timer = null
             },delay)
         }

         const cancel = () => {
            if(timer){
                clearTimeout(timer)
                timer = null
            }
         }

         return { debouncedFn, cancel }
}

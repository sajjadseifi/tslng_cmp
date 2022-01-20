export const worker_proxy =(obj:any,can_work:boolean)=>{
    const a = new Proxy(obj,{
        get(target:any,property:any){
            return can_work ? target[property] : null;
        }
    })

    return a;
}
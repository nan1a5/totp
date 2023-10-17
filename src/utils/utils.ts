export function debounce(this: any, fn: Function, delay: number) {
  let timer: any = null;
  let _this = this;
  return function (...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(_this, args);
    }, delay);
  };
}

export function throttle(this: any, fn: Function, delay: number) {
    let timeout:any = null;
    let _this = this;
    return function(...args:any[]) {     
      if(!timeout){
        timeout = setTimeout(()=>{
          timeout = null;
          fn.apply(_this, args)
        },delay)
      }
    }
  }
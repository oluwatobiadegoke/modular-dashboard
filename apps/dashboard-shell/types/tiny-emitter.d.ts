declare module 'tiny-emitter' {
    class TinyEmitter {
      on(event: string, callback: Function, ctx?: any): this;
      once(event: string, callback: Function, ctx?: any): this;
      off(event: string, callback?: Function): this;
      emit(event: string, ...args: any[]): this;
    }
    export default TinyEmitter;
  }
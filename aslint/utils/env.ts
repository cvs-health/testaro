declare let jest: any;
export class Env {

  public static get isTest(): boolean {
    return typeof jest !== 'undefined';
  }

}

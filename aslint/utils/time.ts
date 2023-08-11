export class Time {

  public static format(duration: any): any {
    const milliseconds: any = Math.floor(duration % 1000);
    const seconds: any = Math.floor(duration / 1000 % 60);
    const minutes: any = Math.floor(duration / (60 * 1000) % 60);
    const hours: any = Math.floor(duration / (60 * 60 * 1000) % 60);
    let time: any = '';

    if (duration < 1) {
      return '< 1 ms';
    }

    if (hours > 0) {
      time += `${hours}h `;
    }

    if (minutes > 0) {
      time += `${minutes}m `;
    }

    if (seconds > 0) {
      time += `${seconds}s `;
    }

    if (milliseconds > 0) {
      time += `${milliseconds}ms`;
    }

    return time;
  }

}

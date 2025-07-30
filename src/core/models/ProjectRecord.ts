export interface ProjectRecordInterface {
  link: string;
  views: number;
  si: number;
  er: number;
  project: string;
  period: string;
}

export default class ProjectRecord implements ProjectRecordInterface {
  link: string;
  views: number;
  si: number;
  er: number;
  project: string;
  period: string;

  constructor(data: ProjectRecordInterface) {
    this.link = data.link;
    this.views = data.views;
    this.si = data.si;
    this.er = data.er;
    this.project = data.project;
    this.period = data.period;
  }

  /**
   * Рассчитывает ЕР как СИ/просмотры * 100
   */
  calculateER(): number {
    if (this.views === 0) return 0;
    return (this.si / this.views) * 100;
  }

  /**
   * Получает ЕР (использует расчет, если er = 0)
   */
  getER(): number {
    if (this.er === 0) {
      return this.calculateER();
    }
    return this.er;
  }
}
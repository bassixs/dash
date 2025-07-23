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
}
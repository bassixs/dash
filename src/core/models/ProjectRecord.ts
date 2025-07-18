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

  constructor({ link, views, si, er, project, period }: ProjectRecordInterface) {
    this.link = link ?? '';
    this.views = views ?? 0;
    this.si = si ?? 0;
    this.er = er ?? 0;
    this.project = project ?? '';
    this.period = period ?? 'Не указан';
  }
}
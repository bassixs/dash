export default class ProjectRecord {
  constructor({ link, views, si, er, project, period }) {
    this.link = link; // URL или текст
    this.views = views || 0; // просмотры
    this.si = si || 0; // СИ
    this.er = er || 0; // ЕР
    this.project = project; // название проекта
    this.period = period || 'Не указан';
  }
}

import ClientErrors from "../Error/ClientErrors";

export default class HttpResponse {
  private data: Default;
  private page: Default | Page;
  private errors: ClientErrors;

  public constructor() {
    this.data = {};

    this.page = {};

    this.errors = new ClientErrors();
  }

  public setData = (data: Default): HttpResponse => {
    this.data = data;

    return this;
  };

  public setPage = (page: Default | Page): HttpResponse => {
    this.page = page;

    return this;
  };

  public setErrors = (errors: ClientErrors): HttpResponse => {
    this.errors = errors;

    return this;
  };
}

interface Page {
  size: number;
  totalElement: number;
  totalPage: number;
  current: number;
}

interface Default {
  [key: string]: any;
}

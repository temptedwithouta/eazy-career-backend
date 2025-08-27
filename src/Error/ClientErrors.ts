export default class ClientErrors {
  public headersErrors: FieldErrors;

  public routePathErrors: FieldErrors;

  public queryParamsErrors: FieldErrors;

  public bodyErrors: FieldErrors;

  public constructor() {
    this.headersErrors = {};

    this.routePathErrors = {};

    this.queryParamsErrors = {};

    this.bodyErrors = {};
  }

  public setHeadersErrors = (headersErrors: FieldErrors): ClientErrors => {
    this.headersErrors = headersErrors;

    return this;
  };

  public setRoutePathErrors = (routePathErrors: FieldErrors): ClientErrors => {
    this.routePathErrors = routePathErrors;

    return this;
  };

  public setQueryParamsErrors = (queryParamsErrors: FieldErrors): ClientErrors => {
    this.queryParamsErrors = queryParamsErrors;

    return this;
  };

  public setBodyErrors = (bodyErrors: FieldErrors): ClientErrors => {
    this.bodyErrors = bodyErrors;

    return this;
  };
}

interface FieldErrors {
  [key: string]: string[];
}

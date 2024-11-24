export class Pagination {
  pageIndex: number;
  pageSize: number;

  constructor(pagination?: any) {
    pagination = pagination || {};
    this.pageSize = pagination.pageSize || 10;
    this.pageIndex = pagination.pageIndex || 1;
  }

  getPageData(): any {
    return {
      page: this.pageIndex,
      rows: this.pageSize,
    };
  }
}

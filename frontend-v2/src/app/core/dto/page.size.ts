export class PageSize {
  pageIndex;
  length;
  pageSize;
  pageSizeOptions;

  constructor(pageSizeData?: any) {
    pageSizeData = pageSizeData || {};
    this.pageIndex = pageSizeData.pageIndex || 1;
    this.length = pageSizeData.length || 0;
    this.pageSize = pageSizeData.pageSize || 10;
    this.pageSizeOptions = pageSizeData.pageSizeOptions || [5, 10, 20];
  }
}

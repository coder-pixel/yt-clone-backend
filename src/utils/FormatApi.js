class FormatApi {
  constructor(query, requestObj) {
    this.query = query; // Mongoose query
    this.method = requestObj?.method?.toUpperCase(); // handling for GET or POST
    this.filters =
      this.method === "GET"
        ? { ...requestObj?.query } // handling for GET
        : this.method === "POST"
          ? { ...requestObj?.body } // handling for POST
          : {};
  }

  filter() {
    const queryObj = { ...this.filters };
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|nin|ne|regex)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.filters.sort) {
      this.query = this.query.sort(this.filters.sort);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  paginate() {
    const page = Number(this.filters.page) || 1;
    const limit = Number(this.filters.limit) || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  selectFields() {
    if (this.filters.fields) {
      const fields = this.filters.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // exclude internal field
    }
    return this;
  }
}

export default FormatApi;

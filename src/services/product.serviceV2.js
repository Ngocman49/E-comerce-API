'use strict';

const {
  product,
  clothing,
  electronic,
  furniture,
} = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductByUser,
} = require('../models/repositories/product.repo');

// use Factory pattern + Stragety Pattern

class ProductFactory {
  /**
   * type: 'Colthing || electronic,
   * payload
   */

  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    console.log(productClass);
    console.log(payload);
    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).createProduct();
  }

  //Put

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // End put

  // query

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };

    return await findAllDraftsForShop({ query, limit, skip });
  }
  static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };

    return await findAllPublishedForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  // end query
}

/// define base product class

class Product {
  constructor({
    product_name,
    product_thumb,
    product_price,
    product_description,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_price = product_price;
    this.product_description = product_description;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

// define sub-class for diffrent product types Clothing

class Clothing extends Product {
  async createProduct() {
    try {
      const newClothing = await clothing.create({
        ...this.product_attributes,
        product_shop: this.product_shop,
      });
      if (!newClothing) throw new BadRequestError('Create new clothing error');
      const newProduct = await super.createProduct();
      if (!newProduct) throw new BadRequestError('create new Product error');
      return newProduct;
    } catch (err) {
      throw new BadRequestError(
        `Create Attributes failed. Detail:::${err.message}`
      );
    }
  }
}

// define sub-class for diffrent product types Electronic
class Electronic extends Product {
  async createProduct() {
    try {
      const newElectronic = await electronic.create({
        ...this.product_attributes,
        product_shop: this.product_shop,
      });

      if (!newElectronic)
        throw new BadRequestError('Create new clothing error');
      const newProduct = await super.createProduct(newElectronic._id);
      if (!newProduct) throw new BadRequestError('create new Product error');
      return newProduct;
    } catch (err) {
      throw new BadRequestError(
        `Create Attributes failed. Detail:::${err.message}`
      );
    }
  }
}
class Furniture extends Product {
  async createProduct() {
    try {
      const newFurniture = await furniture.create({
        ...this.product_attributes,
        product_shop: this.product_shop,
      });
      if (!newFurniture) throw new BadRequestError('Create new clothing error');
      const newProduct = await super.createProduct(newFurniture._id);
      if (!newProduct) throw new BadRequestError('create new Product error');
      return newProduct;
    } catch (err) {
      throw new BadRequestError(
        `Create Attributes failed. Detail:::${err.message}`
      );
    }
  }
}

// register product type
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;

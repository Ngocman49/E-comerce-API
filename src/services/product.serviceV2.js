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
  findAllProducts,
  findProduct,
  updateProductById,
} = require('../models/repositories/product.repo');
// const shopModel = require('../models/shop.model');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
const { insertInventory } = require('../models/repositories/inventory.repo');

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
    // const foundShop = await shopModel.findById(payload.product_shop);

    // if (!foundShop) {
    //   throw new BadRequestError(`No shop with that id`);
    // }
    const productClass = ProductFactory.productRegistry[type];
    console.log(productClass);
    console.log(payload);
    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    // const foundShop = await shopModel.findById(payload.product_shop);

    // if (!foundShop) {
    //   throw new BadRequestError(`No shop with that id`);
    // }
    const productClass = ProductFactory.productRegistry[type];
    console.log(productClass);
    console.log(payload);
    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }
    return new productClass(payload).updateProduct(productId);
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
  static async findAllProducts({
    limit = 50,
    sort = 'ctime',
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      filter,
      page,
      select: ['product_name', 'product_price', 'product_thumb'],
    });
  }
  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ['__v'] });
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
    const newProduct = await product.create({ ...this, _id: product_id });
    //console.log(`new Product is:::`, newProduct);

    const young = await insertInventory({
      productId: newProduct._id,
      shopId: this.product_shop,
      stock: this.product_quantity,
    });

    return newProduct;
  }

  // update product

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product });
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
  async updateProduct(productId) {
    /**
     * check gia tri dau vao
     * {
     *    a: undefined
     *    b: null
     * }
     * 1) xoa gia tri null or undefined
     * 2) check xem update o attributes nao?
     */
    console.log(`[1]:::`, this);
    const objectParams = removeUndefinedObject(this);
    console.log(`[2]:::`, objectParams);

    if (objectParams.product_attributes) {
      // update child
      await updateProductById({
        productId,
        objectParams,
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updateProduct;
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
      console.log(newProduct);
      if (!newProduct)
        throw new BadRequestError('create new Product error roi');
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

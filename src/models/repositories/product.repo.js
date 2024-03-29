'use strict';

const {
  product,
  electronic,
  clothing,
  furniture,
} = require('../../models/product.model');

const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} = require('./../../utils/index');
const { Types } = require('mongoose');

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const findAllPublishedForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();
  return results ? results : null;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOneAndUpdate(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    {
      isDraft: false,
      isPublished: true,
    },
    {
      new: true,
    }
  );
  console.log(`Published: ${foundShop}`);
  return foundShop;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOneAndUpdate(
    {
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    },
    {
      isDraft: true,
      isPublished: false,
    },
    {
      new: true,
    }
  );
  return foundShop;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select)) // getSelectData transform ['a','b'] to {a:1, b:2}
    .lean()
    .exec();

  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  const foundProduct = await product
    .findById(product_id)
    .populate('product_shop', 'name email -_id')
    .select(unGetSelectData(unSelect))
    .lean();
  console.log(foundProduct);
  return foundProduct;
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};

const queryProduct = async ({ query, limit, skip }) => {
  // console.log(query);
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const getProductById = async (productId) => {
  return await product
    .findOne({
      _id: convertToObjectIdMongodb(productId),
    })
    .lean();
};

module.exports = {
  findAllDraftsForShop,
  findAllPublishedForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
};

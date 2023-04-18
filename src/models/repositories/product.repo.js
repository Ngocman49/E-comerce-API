'use strict';

const {
  product,
  electronic,
  clothing,
  furniture,
} = require('../../models/product.model');
const { Types } = require('mongoose');

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};
const findAllPublishedForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
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
  if (!foundShop) {
    return null;
  }

  const { modifiedCount } = foundShop.updateOne(foundShop);
  return modifiedCount;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

module.exports = {
  findAllDraftsForShop,
  findAllPublishedForShop,
  publishProductByShop,
};

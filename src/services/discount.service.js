'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const discount = require('../models/discount.model');
const { findAllProducts } = require('../models/repositories/product.repo');
const { convertToObjectIdMongodb } = require('../utils');

/**
 * Discount services
 * 1./ Generator discount code [shop/admin],
 * 2./ Get discount amount [user],
 * 3./ Get all discount code [user],
 * 4./ Get all product by discount code,
 * 5./ Delete discount Code [admin/ shop],
 * 6./ cancel discount code [user]
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      users_used,
    } = payload;
    // check

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError(
        `Ngay bat dau phai lon hon thoi diem hien tai!`
      );
    }
    //create index for discount

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError(`Start_date must be before end_date`);
    }

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active == true) {
      throw new BadRequestError(`This code has exists`);
    }
    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_max_value: max_value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_shopId: shopId,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode() {}

  /**
   * get all discount codes avaiable with products
   */
  static async getAllDiscountCode({ code, shopId, userId, limit, page }) {
    // create index for discount_code

    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError(`discount not exist`);
    }
    const { discount_applies_to, discount_product_ids } = foundDiscount;
    if (discount_applies_to === 'all') {
      // get all product
      product = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }
    if (discount_applies_to === 'specific') {
      product = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    // get the product ids
  }

  /**
   * get all discount code of shop
   */

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    // const discounts = await
    const discounts = await findAllDiscountCodeUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discount,
    });
    return discounts;
  }
}

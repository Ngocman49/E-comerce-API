/**
 * Key feature: Cart service
 * - add product to cart
 * - reduce product quantity by one (user)
 * - increase product quantity by one (user)
 * - delete cart
 * - delete item
 * - get cart
 */

const { cart } = require('../models/cart.model');
const { getProductById } = require('../models/repositories/product.repo');

const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require('../core/error.response');
class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateOrInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }
  static async updateCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active',
      },
      updateSet = {
        $inc: {
          'cart_products.$.quantity': quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }
  static async addToCart({ userId, product = {} }) {
    // check cart exits ?
    const userCart = await cart.findOne({ cart_userId: userId });
    if (!userCart) {
      // create cart for user
      return await CartService.createUserCart({ userId, product });
    }

    // neu co gio hang roi va chua co san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    const foundProduct = await cart.findOne({
      'cart_products.productId': product.productId,
    });

    if (foundProduct) {
      // neu ton tai gio hang va da co san pham nay -> quantity +1
      return await CartService.updateCartQuantity({ userId, product });
    }
    return await CartService.createUserCart({ userId, product });
  }

  // update cart
  /*
    shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    price, 
                    shopId, 
                    old_quantity,
                    productId,
                },
            ],
            version
        }
    ]

    get data from frontend
  */

  static async addToCartV2({ userId, shop_order_ids = {} }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    // check product exits?
    const foundProduct = await getProductById(productId);
    console.log(foundProduct.product_shop);
    if (!foundProduct) {
      throw new NotFoundError(' ');
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new NotFoundError(`Product do not belong to the shop`);
    }
    if (quantity === 0) {
      /// deleted
    }

    return await CartService.updateCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: 'active' },
      updateSet = {
        $pull: {
          cart_products: {
            productId,
          },
        },
      };
    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart.findOne({
      cart_userId: +userId,
    });
  }
}
module.exports = CartService;

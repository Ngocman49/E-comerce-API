'use strict';
const Inventory = require('./../inventory.model');
const { Types } = require('mongoose');

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = 'unkown',
}) => {
  try {
    const newInventory = await Inventory.create({
      inven_productId: productId,
      inven_location: location,
      inven_stock: stock,
      inven_shopId: shopId,
    });
    return newInventory;
  } catch (err) {
    console.log(`something went wrong:::`, err.message);
  }
};

module.exports = {
  insertInventory,
};

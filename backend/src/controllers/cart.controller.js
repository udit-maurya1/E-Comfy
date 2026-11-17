import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import getStockByProductAndVariant from "../dao/product.dao.js";
import { getAggregatedCart, emptyCart } from "../dao/cart.dao.js";

/**
 * @desc add item to cart
 * @route POST /api/cart/add/:productId/:variantId
 * @access Private
 */

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;
    const stock = await getStockByProductAndVariant(productId, variantId);

    // Find the product and variant
    const productItem = await Product.findById(productId);
    if (!productItem) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variantItem = productItem.variant.id(variantId);
    if (!variantItem) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create a new cart for the user
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.variant.toString() === variantId,
    );

    if (existingItemIndex > -1) {
      if (cart.items[existingItemIndex].quantity + quantity > stock) {
        return res.status(400).json({
          message: `Cannot add more than ${stock} items to the cart`,
        });
      }
      // If the item exists, update the quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      if (quantity > stock) {
        return res.status(400).json({
          message: `Cannot add more than ${stock} items to the cart`,
        });
      }
      // If the item doesn't exist, add it to the cart
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: variantItem.price,
      });
    }

    await cart.save();
    const aggregatedCart = await getAggregatedCart(userId);
    res.status(200).json({
      message: "Item added to cart",
      cart: aggregatedCart || emptyCart(cart._id, userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 *
 * @desc get cart items
 * @route GET /api/cart/items
 * @access Private
 */

export const getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await getAggregatedCart(userId);

    if (!cart) {
      // No cart yet, or everything in it pointed at products that are gone.
      const existing = await Cart.findOne({ user: userId });
      const newCart = existing || (await new Cart({ user: userId, items: [] }).save());
      return res
        .status(existing ? 200 : 201)
        .json({ cart: emptyCart(newCart._id, userId) });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 *
 * @desc remove cart items
 * @route DELETE /api/cart/remove/:itemId
 * @access Private
 */

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    cart.items.pull(itemId);
    await cart.save();
    const aggregatedCart = await getAggregatedCart(userId);
    res.status(200).json({
      message: "Item removed from cart",
      cart: aggregatedCart || emptyCart(cart._id, userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 *
 * @desc update cart item quantity
 * @route PUT /api/cart/update/:itemId
 * @access Private
 */

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    const stock = await getStockByProductAndVariant(
      cartItem.product,
      cartItem.variant,
    );
    if (quantity > stock) {
      return res.status(400).json({
        message: "Cannot update quantity to more than available stock",
      });
    }
    cartItem.quantity = quantity;
    await cart.save();
    const aggregatedCart = await getAggregatedCart(userId);
    res.status(200).json({
      message: "Cart item quantity updated",
      cart: aggregatedCart || emptyCart(cart._id, userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

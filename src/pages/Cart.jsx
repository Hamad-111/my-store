import React, { useMemo, useEffect } from 'react';
import './Cart.css';
import { useCart } from '../context/CartContext.jsx';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();

  const { cart = [], removeFromCart, increaseQty, decreaseQty } = useCart();

  useEffect(() => {
    if (!authReady) return; // ✅ wait until session restored
    if (!user) navigate('/login', { replace: true, state: { pulse: true } });
  }, [user, authReady, navigate]);

  if (!authReady) return null;
  if (!user) return null;

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.qty || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
        0
      ),
    [cart]
  );

  return (
    <div className="cart-container">
      <div className="cart-content">
        <h2 className="cart-title">Shopping Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">
              <div className="icon-circle">!</div>
            </div>

            <h3>No products found</h3>
            <p>
              We couldn’t find any products in your cart. Let’s add some
              trending items!
            </p>

            <button className="explore-btn" onClick={() => navigate('/')}>
              Show Trending Items
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const qty = Number(item.qty || 1);
                const price = Number(item.price || 0);
                const lineTotal = price * qty;

                const showSale =
                  Number(item.salePercent || 0) > 0 ||
                  Number(item.originalPrice || 0) > price;

                return (
                  <div
                    className="cart-item"
                    key={`${item.id}-${item.size || ''}`}
                  >
                    <div className="cart-left">
                      <div className="cart-img-wrapper">
                        {showSale ? (
                          <div className="cart-sale-badge">
                            {Number(item.salePercent || 0) > 0
                              ? `${item.salePercent}% OFF`
                              : 'Sale'}
                          </div>
                        ) : (
                          <div className="cart-sale-badge cart-no-sale">
                            No Sale
                          </div>
                        )}

                        <img
                          src={item.image}
                          alt={item.name}
                          className="cart-item-img"
                        />
                      </div>
                    </div>

                    <div className="cart-center">
                      <h4 className="cart-name">{item.name}</h4>
                      <p className="cart-code">{item.brand}</p>

                      {item.size ? (
                        <p className="cart-size">
                          Size: <strong>{item.size}</strong>
                        </p>
                      ) : null}

                      {item.description ? (
                        <p className="cart-desc">{item.description}</p>
                      ) : null}

                      <div className="qty-controls">
                        <button
                          onClick={() =>
                            decreaseQty(item.id, item.size || null)
                          }
                        >
                          -
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() =>
                            increaseQty(item.id, item.size || null)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-right">
                      <p className="cart-price">
                        PKR {lineTotal.toLocaleString()}
                      </p>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          removeFromCart(item.id, item.size || null)
                        }
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3>Total Items: {totalItems}</h3>
              <h3>Total Price: PKR {totalPrice.toLocaleString()}</h3>

              <button
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

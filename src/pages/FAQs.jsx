import React, { useState } from 'react';
import './FAQs.css';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'Shipping, Order Tracking & Delivery',
    answer:
      'We deliver across Pakistan within 3–7 working days. Once your order is dispatched, you’ll receive a tracking link via SMS or email. Free delivery is available on orders above Rs. 3000.',
  },
  {
    question: 'Cancellations and Modifications',
    answer:
      'Orders can be modified or cancelled within 2 hours after placing them. Please contact our customer service team immediately for assistance.',
  },
  {
    question: 'Sign Up and Login',
    answer:
      'Create an account to view your order history, manage your addresses, and enjoy faster checkout.',
  },
  {
    question: 'Returns and Replacement',
    answer:
      'If you receive a wrong or damaged product, you can request a return within 7 days of delivery. Returns are free and processed within 5 working days.',
  },
  {
    question: 'Payments',
    answer:
      'We accept Cash on Delivery (COD), debit/credit cards, Easypaisa, and JazzCash. All transactions are 100% secure and encrypted.',
  },
  {
    question: 'Coupons',
    answer:
      'You can apply discount coupons during checkout. Only one coupon can be used per order, and it must be valid at the time of use.',
  },
  {
    question: 'Buy Now, Pay Later in Installments',
    answer:
      "We offer easy monthly installment plans through select payment partners. Choose the 'Installment' option at checkout to see your available plans.",
  },
  {
    question: 'Open Parcel Delivery',
    answer:
      'You can request open parcel delivery in select cities. Please confirm with the courier before opening the parcel. Items cannot be tried before payment.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    // only one open at a time
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <h1 className="faq-title">Frequently Asked Questions</h1>

      <div className="faq-wrapper">
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <div className="faq-icon">
                  {openIndex === index ? (
                    <Minus size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                </div>
                <span>{faq.question}</span>
              </div>

              {/* Only one open at a time */}
              <div
                className={`faq-answer-wrapper ${openIndex === index ? 'open' : ''
                  }`}
              >
                <div className="faq-answer">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

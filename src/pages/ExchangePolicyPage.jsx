import React from 'react';
import './Policies.css';

export default function ExchangePolicyPage() {
    return (
        <div className="policy-page">
            <h1 className="policy-title">Exchange Policy</h1>
            <div className="policy-content">
                <p>At Vestivistora, we want you to be completely satisfied with your purchase. If you are not happy with your order, we offer a hassle-free exchange policy.</p>

                <h2>Eligibility for Exchange</h2>
                <ul>
                    <li>Items must be unused, unwashed, and in their original condition with tags attached.</li>
                    <li>Exchange requests must be made within 7 days of receiving the order.</li>
                    <li>Sale items are not eligible for exchange unless defective.</li>
                </ul>

                <h2>Process</h2>
                <p>To initiate an exchange, please contact our customer support team at care@vestivistora.com with your order number and reason for exchange. Our team will guide you through the process.</p>

                <h2>Defective or Damaged Items</h2>
                <p>If you receive a defective or damaged item, please notify us immediately within 48 hours of delivery. We will arrange for a replacement at no extra cost.</p>

                <h2>Non-Exchangeable Items</h2>
                <p>Accessories and jewelry are non-exchangeable for hygiene reasons.</p>
            </div>
        </div>
    );
}

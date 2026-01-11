import React, { useState } from 'react';
import './PrivacyPolicy.css';
import { Plus, Minus } from 'lucide-react';

const privacyData = [
  {
    question: 'Scope and Updates of This Privacy Policy',
    answer:
      'This policy applies to all users of our multi-brand clothing store website and mobile app. We may update this policy occasionally to reflect new regulations or business changes. Updates will be posted here immediately.',
  },
  {
    question: 'Controller',
    answer:
      'Your data is managed by Vesti Vistora, the owner and operator of this online store. We ensure your personal data is handled safely and transparently.',
  },
  {
    question: 'What Personal Data We Collect and Process',
    answer:
      'We collect personal data such as your name, phone number, shipping address, and payment details during order placement. We may also collect browsing data to improve our services.',
  },
  {
    question: 'Your Non-Personal Information',
    answer:
      'We collect non-personal data like browser type, device, and session duration to enhance website performance and user experience.',
  },
  {
    question: 'Use of Information',
    answer:
      'Your information helps us process your orders, personalize your shopping experience, and provide updates about new arrivals, offers, and promotions.',
  },
  {
    question: 'Information Shared with Authorities or Partners',
    answer:
      'We may share limited data with trusted delivery partners for shipping purposes or law enforcement when legally required.',
  },
  {
    question: 'Use of Cookies',
    answer:
      'Cookies help us remember your preferences, shopping cart, and login sessions to provide a smoother browsing experience.',
  },
  {
    question: 'Your Rights to Control Your Personal Information',
    answer:
      'You can request to access, update, or delete your personal data at any time by contacting our support team.',
  },
  {
    question: 'Withdraw Consent / Opt-Out',
    answer:
      'You may opt out of receiving promotional emails and SMS by clicking ‘unsubscribe’ or adjusting your preferences in your account settings.',
  },
  {
    question: 'Security',
    answer:
      'We use secure encryption (SSL) and trusted payment gateways to protect your data from unauthorized access or misuse.',
  },
  {
    question: 'Other Website Links',
    answer:
      'Our website may contain links to third-party sites. We are not responsible for their privacy practices, so please review their policies separately.',
  },
  {
    question: 'Public Forums',
    answer:
      'If you post reviews or comments, please remember that they are visible publicly and can be viewed by other users.',
  },
  {
    question: 'Change in Terms of Privacy Policy',
    answer:
      'We may revise this policy at any time. Continued use of our website after any change constitutes acceptance of the new terms.',
  },
  {
    question: 'Contact Us',
    answer:
      'For questions about privacy or data protection, contact us at support@vestivistora.com.',
  },
];

export default function PrivacyPolicy() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-title"> Privacy Policy</h1>
        <p className="privacy-intro">
          We care deeply about your privacy. This policy explains how we
          collect, use, and protect your personal data when you shop with us or
          use our website and mobile application.
        </p>

        <div className="privacy-columns">
          <div className="column">
            {privacyData
              .slice(0, Math.ceil(privacyData.length / 2))
              .map((item, index) => (
                <div key={index} className="privacy-item">
                  <div
                    className="privacy-question"
                    onClick={() => toggleAnswer(index)}
                  >
                    <span className="icon">
                      {openIndex === index ? (
                        <Minus size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </span>
                    {item.question}
                  </div>

                  {openIndex === index && (
                    <div className="privacy-answer">{item.answer}</div>
                  )}
                </div>
              ))}
          </div>

          <div className="column">
            {privacyData
              .slice(Math.ceil(privacyData.length / 2))
              .map((item, index) => {
                const realIndex = index + Math.ceil(privacyData.length / 2);
                return (
                  <div key={realIndex} className="privacy-item">
                    <div
                      className="privacy-question"
                      onClick={() => toggleAnswer(realIndex)}
                    >
                      <span className="icon">
                        {openIndex === realIndex ? (
                          <Minus size={18} />
                        ) : (
                          <Plus size={18} />
                        )}
                      </span>
                      {item.question}
                    </div>

                    {openIndex === realIndex && (
                      <div className="privacy-answer">{item.answer}</div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

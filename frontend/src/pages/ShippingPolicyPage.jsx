import React from "react";

const ShippingReturns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Shipping & Returns Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Shipping Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Shipping Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Domestic Shipping</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Standard shipping: 3-5 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Express shipping: 1-2 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Free shipping on orders above ₹10,000</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Orders processed within 24-48 hours</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">International Shipping</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Available to select countries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Delivery time: 7-14 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Customs duties and taxes are the responsibility of the recipient</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Tracking</h3>
                <p className="text-gray-700">
                  Once your order is shipped, you will receive a tracking number via email and SMS. 
                  You can track your order by logging into your account and visiting the 'My Orders' section.
                </p>
              </div>
            </div>
          </section>

          {/* Returns Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Returns & Exchanges
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Return Policy</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>30-day return policy from the date of delivery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Items must be in original condition with all tags and packaging</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Custom-made or personalized items cannot be returned</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Returns are subject to quality inspection</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Return</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-900 font-semibold mr-2">1.</span>
                    <span>Log into your account and go to 'My Orders'</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 font-semibold mr-2">2.</span>
                    <span>Select the item you wish to return</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 font-semibold mr-2">3.</span>
                    <span>Follow the return process and print the return label</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 font-semibold mr-2">4.</span>
                    <span>Package the item securely and ship it back to us</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Process</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Refunds processed within 5-7 business days after receiving the return</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Refund issued to original payment method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Shipping charges are non-refundable unless the return is due to our error</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Exchanges</h3>
                <p className="text-gray-700 mb-3">
                  We offer free exchanges within 30 days of purchase:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Exchanges are subject to stock availability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>If the desired item is not available, you'll receive store credit or a refund</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span>Contact customer support for exchange requests</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-700">
              For any questions regarding shipping or returns, please contact our customer support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturns;
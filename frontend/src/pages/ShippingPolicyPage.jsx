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
          {/* Returns Section */}
<section>
  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
    Returns & Refunds
  </h2>

  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold text-red-600 mb-3">
         No Returns & No Refunds Policy
      </h3>
      <p className="text-gray-700 mb-4">
        Please note that all sales are final. We do NOT accept returns, exchanges, or refunds under any circumstances once the order has been placed or delivered.
      </p>

      <ul className="space-y-2 text-gray-700">
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Returns are NOT accepted for any product</span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Refunds will NOT be issued since returns are not allowed</span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Once an order is placed, it cannot be canceled</span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Please check product details carefully before purchasing</span>
        </li>
      </ul>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Exception (if applicable)
      </h3>
      <p className="text-gray-700">
        A replacement may be considered ONLY if:
      </p>
      <ul className="space-y-2 text-gray-700 mt-3">
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Wrong item delivered</span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Damaged product received</span>
        </li>
        <li className="flex items-start">
          <span className="text-gray-500 mr-2">•</span>
          <span>Customer must report within 48 hours with photos/videos</span>
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
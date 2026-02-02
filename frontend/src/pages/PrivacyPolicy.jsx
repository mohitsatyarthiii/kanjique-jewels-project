import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Privacy Policy
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
          <div className="space-y-10">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Kanjique Jewels ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you visit our website or make a purchase from us.
              </p>
              <p className="text-gray-700">
                By using our website, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Information Collection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Name, email address, phone number</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Shipping and billing addresses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Payment information (processed securely by payment gateways)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Order history and preferences</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>IP address and browser type</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Pages visited and time spent on site</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-2">•</span>
                      <span>Device information and operating system</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Use of Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>To process and fulfill your orders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>To communicate with you about orders, products, and promotions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>To improve our website and customer experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>To prevent fraudulent transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>To comply with legal obligations</span>
                </li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share information with:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Service providers (shipping companies, payment processors)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Legal authorities when required by law</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Business partners with your consent</span>
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your 
                personal information. These include:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>SSL encryption for data transmission</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Secure servers and firewalls</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Regular security audits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Limited access to personal data</span>
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Access your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray500 mr-2">•</span>
                  <span>Correct inaccurate information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Withdraw consent at any time</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p>Email: privacy@kanjiquejewels.com</p>
                <p>Phone: +91 98765 43210</p>
                <p>Address: 123 Jewel Street, Mumbai 400001, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
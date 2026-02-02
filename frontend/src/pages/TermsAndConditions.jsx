import React from "react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Terms & Conditions
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
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing or using the Kanjique Jewels website, you agree to be bound by these 
                Terms and Conditions. If you disagree with any part of these terms, you may not 
                access the website or make purchases from us.
              </p>
            </section>

            {/* Products */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Products and Pricing</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  All products are subject to availability. We reserve the right to discontinue 
                  any product at any time. Prices are subject to change without notice.
                </p>
                <p>
                  We make every effort to display accurate product colors and images, but actual 
                  colors may vary depending on your device's display.
                </p>
              </div>
            </section>

            {/* Orders */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Orders and Payment</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>All orders are subject to acceptance and availability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Payment must be received before order processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>We accept all major credit/debit cards, UPI, and net banking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Prices include GST but exclude shipping charges unless specified</span>
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on this website, including text, graphics, logos, images, and software, 
                is the property of Kanjique Jewels and is protected by copyright laws. 
                You may not reproduce, distribute, or create derivative works without our 
                written permission.
              </p>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Use the website for any unlawful purpose</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Attempt to gain unauthorized access to any part of the website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Interfere with the proper working of the website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Submit false or misleading information</span>
                </li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Kanjique Jewels shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Your use or inability to use the website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Any unauthorized access to or use of our servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Any interruption or cessation of transmission to or from the website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <span>Any bugs, viruses, or similar issues</span>
                </li>
              </ul>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless Kanjique Jewels and its affiliates from 
                any claims, damages, liabilities, costs, or expenses arising from your use of the 
                website or violation of these terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of 
                India. Any disputes shall be subject to the exclusive jurisdiction of the courts 
                in Mumbai, Maharashtra.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting on the website. Your continued use of the website 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="space-y-2 text-gray-700">
                <p>For any questions about these Terms, please contact us:</p>
                <p>Email: legal@kanjiquejewels.com</p>
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

export default TermsConditions;
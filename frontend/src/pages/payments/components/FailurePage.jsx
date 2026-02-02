import React from "react";

export default function FailurePage() {
  return (
    <div className="max-w-2xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h1>
      <p>Payment was not successful. Please try again.</p>
    </div>
  );
}

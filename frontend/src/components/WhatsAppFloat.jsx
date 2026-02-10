import React from "react";

const WhatsAppFloat = () => {
  const whatsappNumber = "918744827772"; // 👉 Yahan apna WhatsApp number daalna (without +)

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-green-500 p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="w-12 h-12"
        />
      </div>
    </a>
  );
};

export default WhatsAppFloat;

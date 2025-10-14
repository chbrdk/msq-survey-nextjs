'use client';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
        <p>
          MSQ Survey Platform © {new Date().getFullYear()} · Powered by n8n & OpenAI
        </p>
      </div>
    </footer>
  );
};



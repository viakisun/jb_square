import React from 'react';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="bg-gray-50 border-b border-gray-300 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-sm border border-gray-300 p-2 bg-white inline-block">
          [BREADCRUMB] {items.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <a href={item.href} className="text-gray-600 hover:text-gray-800">
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-800 font-medium">{item.label}</span>
              )}
              {index < items.length - 1 && <span className="mx-2 text-gray-400">&gt;</span>}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;


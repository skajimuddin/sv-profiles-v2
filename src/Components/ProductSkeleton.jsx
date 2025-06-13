import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform border border-gray-100 animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="md:flex">
        <div className="md:w-1/2">
          <div className="w-full h-96 bg-gray-300"></div>
        </div>
        
        <div className="md:w-1/2 p-6 md:p-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
          
          <div className="h-6 w-24 bg-gray-300 rounded-full mb-6"></div>
          
          <div className="mb-6">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-300 rounded-l"></div>
              <div className="h-10 w-16 bg-gray-200 border border-gray-300"></div>
              <div className="h-10 w-10 bg-gray-300 rounded-r"></div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="h-12 bg-gray-300 rounded flex-1"></div>
            <div className="h-12 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="border rounded-lg overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className={`flex ${item % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="w-1/3 px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="w-2/3 px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;

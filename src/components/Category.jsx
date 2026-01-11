import React from 'react';
import './Category.css';

export default function CategorySection() {
  const categories = [
    {
      name: "Winter '25",
      image: '/images/image 7.png',
    },
    {
      name: 'Unstitched',
      image: '/images/image 6.png',
    },
    {
      name: 'Hot Selling',
      image: '/images/image2.png',
    },
    {
      name: 'Pret',
      image: '/images/image 8.png',
    },
    {
      name: 'Wedding',
      image: '/images/image 9.png',
    },
    {
      name: 'Men',
      image: '/images/image 10.png',
    },
  ];

  return (
    <section className="category-section">
      <div className="category-container">
        {/* Section Header */}
        <div className="category-header">
          <h2>Shop By Category</h2>
          <div className="sale-badge">Till Sale</div>
        </div>

        {/* Categories Circles */}
        <div className="categories-horizontal">
          {categories.map((category, index) => (
            <div key={index} className="category-circle">
              <div className="circle-image">
                <img
                  src={category.image}
                  alt={category.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/120x120/f8f8f2/e8eed0?text=${category.name.charAt(
                      0
                    )}`;
                  }}
                />
              </div>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

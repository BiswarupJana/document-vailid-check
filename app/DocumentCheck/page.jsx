'use client'
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const DocumentChecker = dynamic(() => import('../../components/DocumentChecker'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Page = () => {
  const [img, setImg] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImg(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      {img && <DocumentChecker image={img} />}
    </div>
  );
}

export default Page;
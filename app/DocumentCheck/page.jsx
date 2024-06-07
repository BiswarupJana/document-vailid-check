'use client'
import React from 'react'
import dynamic from 'next/dynamic';
// import { useEffect, useState } from 'react';

const DocumentChecker = dynamic(() => import('../../components/DocumentChecker'), {
  ssr: false
});

const page = () => {
  return (
    <div>page</div>
  )
}

export default page
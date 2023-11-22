import React, { useState, useEffect } from 'react';

export const MessageImage: React.FC<{ image: string }> = ({ image }) => (
  <img src={image} alt="Message" className="max-w-full h-auto" />
);

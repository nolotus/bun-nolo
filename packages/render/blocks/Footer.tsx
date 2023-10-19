import React from 'react';
import LanguageSelector from '../../i18n/LanguageSelector';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-300">
      <div className="container mx-auto px-4 lg:px-10 py-4 flex justify-between items-center">
        <p className="text-gray-600">© 2023 nolotus. All rights reserved.</p>
        <div className="language-selector">
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from 'react';

interface UploadComponentProps {
  onUpload: (file: File) => void;
}

const UploadComponent: React.FC<UploadComponentProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files![0]);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadComponent;

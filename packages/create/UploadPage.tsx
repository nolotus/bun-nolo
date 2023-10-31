import React, { useState, useCallback } from 'react';
import Image from 'render/blocks/Image';
import Upload from 'render/blocks/Upload';

const UploadPage: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>('');

  const handleUpload = useCallback(async (file: File) => {
    // 这里假设我们已经有了一个服务器端接口来处理上传
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', { method: 'POST', body: formData });
    const { hashes } = await response.json();

    // 获取并拼接所有切片
    const chunks = [];
    for (const hash of hashes) {
      const response = await fetch(`/chunks/${hash}`);
      const blob = await response.blob();
      chunks.push(blob);
    }

    const imageBlob = new Blob(chunks, { type: 'image/jpeg' });
    const imageSrc = URL.createObjectURL(imageBlob);
    setImageSrc(imageSrc);
  }, []);

  return (
    <div>
      <Upload onUpload={handleUpload} />
      <Image src={imageSrc} />
    </div>
  );
};

export default UploadPage;

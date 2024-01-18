import React, { useState, useEffect } from "react";

export const MessageImage: React.FC<{ url: string }> = ({ url }) => (
	<img src={url} alt="Message" className="max-w-full h-auto" />
);

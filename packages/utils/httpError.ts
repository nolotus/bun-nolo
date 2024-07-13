const HTTP_STATUS_MESSAGES = {
  400: "Bad request: The server could not understand the request",
  401: "Unauthorized: Authentication is required",
  403: "Forbidden: You do not have permission to access this resource",
  404: "Not Found: The requested resource could not be found",
  410: "Gone: The requested resource is no longer available and has been permanently removed",
  500: "Internal Server Error: Something went wrong on the server",
};

export const handleHttpError = (status: number) => {
  return (
    HTTP_STATUS_MESSAGES[status] || `Server responded with status: ${status}`
  );
};

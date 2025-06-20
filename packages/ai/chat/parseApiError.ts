// 处理失败的API响应
export async function parseApiError(response: Response): Promise<string> {
  const errorBody = await response.text();
  let defaultMessage = `状态码 ${response.status} ${response.statusText}`;
  let errorMessage = defaultMessage;
  let errorCode: string | null = `E${response.status}`;

  try {
    const errorJson = JSON.parse(errorBody);
    errorMessage = errorJson?.error?.message || errorBody || defaultMessage;
    errorCode = errorJson?.error?.code || errorCode;
  } catch (_e) {
    if (errorBody) {
      errorMessage = errorBody;
    }
  }

  switch (response.status) {
    case 400:
      return "请求参数错误，请检查输入";
    case 401:
      switch (errorCode) {
        case "AUTH_TOKEN_EXPIRED":
          return "令牌已过期，请重新登录";
        case "AUTH_ACCOUNT_INVALID":
          return "账户无效或已被停用，请联系管理员";
        case "AUTH_NO_TOKEN":
          return "未提供身份验证令牌，请登录";
        case "AUTH_INVALID_TOKEN":
          return "无效的身份验证令牌，请重新登录";
        case "AUTH_TOKEN_NOT_ACTIVE":
          return "令牌尚未生效，请稍后再试";
        default:
          return "身份验证失败，请检查您的凭据";
      }
    case 504:
      return "请求超时，请稍后再试";
    default:
      return `API请求失败: ${errorMessage}`;
  }
}

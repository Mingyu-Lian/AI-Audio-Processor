export const apiRequest = async (
  url: string,
  method: string = "GET",
  body: any = null,
  token?: string
) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (!token) {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      token = JSON.parse(storedUser).token;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseURL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || data.message || "API Request Failed");
    }

    return data;
  } catch (error: any) { // 确保 error 类型正确
    console.error("API Request Error:", error); // ✅ 更安全的错误输出方式
    throw new Error(error?.message || "An unexpected error occurred.");
  }
};

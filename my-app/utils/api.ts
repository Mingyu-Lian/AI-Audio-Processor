export const apiRequest = async (url: string, method: string = "GET", body: any = null) => {
    const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null;
  
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
  
    if (token) {
      headers["Authorization"] = `Bearer ${token}`; // ✅ 自动添加 JWT 令牌
    }
  
    const response = await fetch(`http://localhost:8000${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.detail || "API Request Failed");
    }
  
    return data;
  };

  
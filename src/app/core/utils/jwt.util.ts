export function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): { id: string; role: string; email: string; name: string } | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub || payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
    role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '',
    email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
    name: payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || ''
  };
}

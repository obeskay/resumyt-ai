export async function getUserQuota(): Promise<number> {
  // Implementa la lógica para obtener la cuota del usuario
  // Por ejemplo, hacer una llamada a tu API
  const response = await fetch('/api/user-quota');
  const data = await response.json();
  return data.quota;
}
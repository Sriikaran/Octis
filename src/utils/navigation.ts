export function navigateToReports(params: Record<string, string>) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return `/reports${queryString ? `?${queryString}` : ''}`;
}

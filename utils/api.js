export const postToZapier = async (data) => {
  const response = await fetch("/api/zapier", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};
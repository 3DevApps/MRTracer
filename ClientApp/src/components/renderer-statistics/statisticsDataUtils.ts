const SESSION_STORAGE_KEY = "render_statistics_data";
const SESSION_STORAGE_SAVED_DATA_KEY = "render_statistics_saved_data";

export function storeDataPoint(category: string, name: string, value: any) {
  const timestamp = Date.now();
  const storedData = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}"
  );

  if (!storedData[category]) {
    storedData[category] = {};
  }
  if (!storedData[category][name]) {
    storedData[category][name] = [];
  }

  storedData[category][name].push({ value, timestamp });
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedData));
}

export function convertToCSV(filteredData: any): string {
  // Create CSV header
  const headers = ["timestamp", "category", "name", "value"];
  let csvContent = headers.join(",") + "\n";

  // Convert nested data structure to CSV rows
  Object.entries(filteredData).forEach(
    ([category, categoryData]: [string, any]) => {
      Object.entries(categoryData).forEach(([name, points]: [string, any]) => {
        points.forEach((point: any) => {
          const row = [point.timestamp, category, name, point.value]
            .map((value) => `"${value}"`)
            .join(",");
          csvContent += row + "\n";
        });
      });
    }
  );

  return csvContent;
}

export function downloadCSV(data: any, fileName: string) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.replace(".json", ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function storeFilteredDataToSessionStorage(data: any, keyName: string) {
  const savedKeys = JSON.parse(
    localStorage.getItem(SESSION_STORAGE_SAVED_DATA_KEY) || "[]"
  );
  localStorage.setItem(
    SESSION_STORAGE_SAVED_DATA_KEY,
    JSON.stringify([...savedKeys, keyName])
  );
  localStorage.setItem(keyName, JSON.stringify(data));
}

export function getStoredDataKeys() {
  return JSON.parse(
    localStorage.getItem(SESSION_STORAGE_SAVED_DATA_KEY) || "[]"
  );
}

export function getStoredData(key: string) {
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function removeStoredData(key: string) {
  const savedKeys = JSON.parse(
    localStorage.getItem(SESSION_STORAGE_SAVED_DATA_KEY) || "[]"
  );
  localStorage.setItem(
    SESSION_STORAGE_SAVED_DATA_KEY,
    JSON.stringify(savedKeys.filter((k: string) => k !== key))
  );
  localStorage.removeItem(key);
}

export function getFilteredData(milliseconds: number, category?: string) {
  const storedData = JSON.parse(
    sessionStorage.getItem(SESSION_STORAGE_KEY) || "{}"
  );
  const cutoffTime = Date.now() - milliseconds;

  const filteredData: any = {};

  if (category) {
    // Filter specific category
    if (storedData[category]) {
      filteredData[category] = {};
      Object.entries(storedData[category]).forEach(
        ([name, points]: [string, any]) => {
          filteredData[category][name] = (points as any[]).filter(
            (point) => point.timestamp >= cutoffTime
          );
        }
      );
    }
  } else {
    // Filter all categories
    Object.entries(storedData).forEach(([cat, categoryData]: [string, any]) => {
      filteredData[cat] = {};
      Object.entries(categoryData).forEach(([name, points]: [string, any]) => {
        filteredData[cat][name] = (points as any[]).filter(
          (point) => point.timestamp >= cutoffTime
        );
      });
    });
  }

  return filteredData;
}

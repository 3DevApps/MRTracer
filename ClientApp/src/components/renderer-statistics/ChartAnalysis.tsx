import { Button, Flex, message, Modal, Tree } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import StaticChart from "./StaticChart";
import {
  getStoredData,
  getStoredDataKeys,
  removeStoredData,
  storeFilteredDataToSessionStorage,
} from "./statisticsDataUtils";
import { DeleteOutlined } from "@ant-design/icons";

export default function ChartAnalysis({ isModalOpen, setIsModalOpen }: any) {
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const [refreshData, setRefreshData] = useState(false);
  const treeData = useMemo(() => {
    const dataKeys = getStoredDataKeys();
    const dataObj: any = {};

    for (const key of dataKeys) {
      dataObj[key] = getStoredData(key);
    }

    return Object.keys(dataObj).map((key) => {
      const data = getStoredData(key);
      return {
        title: (
          <div
            style={{
              position: "relative",
            }}
          >
            <p>{key}</p>
            <Button
              style={{
                position: "absolute",
                top: "-4px",
                left: "240px",
              }}
              type="text"
              onClick={() => {
                removeStoredData(key);
                setRefreshData((prev) => !prev);
                message.success("Data removed");
              }}
            >
              <DeleteOutlined />
            </Button>
          </div>
        ),
        key: key,
        checkable: false,
        children: Object.keys(data).map((category) => {
          return {
            title: category,
            key: `${key}#${category}`,
          };
        }),
      };
    });
  }, [isModalOpen, refreshData]);

  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const [chartData, setChartData] = useState<any>([]);
  const [chartCategory, setChartCategory] = useState<any>([]);

  const onCheck = useCallback(
    (checkedKeys: any) => {
      if (checkedKeys.length > 1) {
        const category1 = checkedKeys[0].split("#")[1];

        for (let i = 1; i < checkedKeys.length; i++) {
          const category2 = checkedKeys[i].split("#")[1];
          if (category1 !== category2) {
            message.error("Please select categories from the same data set");
            return;
          }
        }
      }

      setSelectedKeys(checkedKeys);
    },
    [selectedKeys]
  );

  useEffect(() => {
    if (selectedKeys.length > 0) {
      const chartData: any = {};

      // Parse keys and categories
      const resolvedKeysAndCategories = selectedKeys.map((key: string) =>
        key.split("#")
      );

      resolvedKeysAndCategories.forEach(
        ([resolvedKey, resolvedCategory]: any[], index: number) => {
          const data = getStoredData(resolvedKey)[resolvedCategory];

          Object.keys(data).forEach((key) => {
            chartData[`${resolvedKey}-${key}`] = data[key].map(
              (point: any) => point.value
            );
          });

          // Optionally set the chart category to the first category in the list
          if (index === 0) {
            setChartCategory(resolvedCategory);
          }
        }
      );

      setChartData(chartData);
    }
  }, [selectedKeys]);

  return (
    <Modal
      title="Chart analysis tool"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      maskClosable={false}
      width={900}
      style={{
        minWidth: "900px",
        paddingTop: "20px",
      }}
    >
      <Flex
        gap="20px"
        justify="space-between"
        style={{
          overflow: "auto",
          height: "calc(100% - 50px)",
        }}
      >
        <Flex vertical gap="20px">
          <Button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".csv";

              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const filename = file.name.replace(".csv", "");
                const content = await file.text();
                try {
                  // Parse the CSV content
                  const lines = content.split("\n");
                  const data: any = {};
                  lines.forEach((line) => {
                    const [timestamp, category, name, value] = line.split(",");

                    if (!category || category === "category") return;

                    if (!data[category]) {
                      data[category] = {};
                    }

                    if (!data[category][name]) {
                      data[category][name] = [];
                    }

                    data[category][name].push({
                      timestamp,
                      value,
                    });
                  });

                  // Save the data to localstorage
                  storeFilteredDataToSessionStorage(data, filename);
                  setRefreshData((prev) => !prev);
                } catch (err) {
                  console.error("Failed to parse settings file:", err);
                } finally {
                  input.remove();
                }
              };

              input.click();
            }}
          >
            Upload chart data
          </Button>
          <Tree
            checkable
            checkedKeys={selectedKeys}
            onCheck={onCheck}
            treeData={treeData}
          />
        </Flex>
        <StaticChart data={chartData} ylabel={chartCategory} />
      </Flex>
    </Modal>
  );
}

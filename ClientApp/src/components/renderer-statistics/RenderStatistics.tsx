import {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./RenderStatistics.css";
import {
  CaretDownOutlined,
  LeftOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMouseHandler } from "../../hooks/useMouseHandler";
import Chart from "./Chart";
import { Button, Dropdown, Flex, message, Space, Tree } from "antd";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import ChartAnalysis from "./ChartAnalysis";
import {
  downloadCSV,
  getFilteredData,
  storeDataPoint,
  storeFilteredDataToSessionStorage,
} from "./statisticsDataUtils";
import { getFormattedDateTime } from "../../utils/getFormattedDate";
import NamePrompt from "./NamePrompt";

export type RenderStatistics = string[];

export type RenderStatisticsProps = {
  renderStatistics: RenderStatistics;
};

export default function RenderStatisticsComponent({
  renderStatistics,
}: RenderStatisticsProps) {
  const [asideStyle, setAsideStyle] = useState({
    width: 450,
    right: -450,
    transition: "0s",
  });
  const closeButtonStyle = useMemo(
    () => ({
      transform: `rotate(${asideStyle.right === 0 ? 180 : 0}deg)`,
      left: asideStyle.right === 0 ? 0 : "-2.5rem",
    }),
    [asideStyle]
  );

  const toggleAside = useCallback(() => {
    setAsideStyle((prev) => ({
      right: prev.right === 0 ? -450 : 0,
      width: 450,
      transition: "0.3s",
    }));
    setTimeout(() => {
      setAsideStyle((prev) => ({
        ...prev,
        transition: "0s",
      }));
    }, 310);
  }, []);

  const mouseMoveHandler: MouseEventHandler<HTMLElement> = useCallback((e) => {
    e.preventDefault();
    const { clientX } = e;
    const newWidth = window.innerWidth - clientX;
    if (newWidth < 450) {
      return;
    }
    setAsideStyle((prev) => ({
      ...prev,
      width: newWidth,
    }));
  }, []);
  const { handleMouseDown, handleMouseMove } =
    useMouseHandler(mouseMoveHandler);

  useEffect(() => {
    // @ts-ignore
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      // @ts-ignore
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const [hasChangedEntries, setHasChangedEntries] = useState(false);
  const categorizedEntries: any = useRef({}).current;
  useEffect(() => {
    if (!renderStatistics.length) {
      return;
    }

    const entries = renderStatistics[0].split("|");
    const timestamp = Date.now();
    for (let i = 0; i < entries.length; i += 3) {
      const category = entries[i];
      const name = entries[i + 1];
      const value = entries[i + 2];
      if (!category || !name || !value) {
        continue;
      }
      if (!categorizedEntries[category]) {
        categorizedEntries[category] = {};
      }
      categorizedEntries[category][name] = { value, timestamp };
      storeDataPoint(category, name, value);
      setHasChangedEntries(true);
    }
  }, [renderStatistics]);

  const { isAdmin } = useContext(JobSettingsContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showNewChartModal, setShowNewChartModal] = useState(false);
  const [chosenCategories, setChosenCategories] = useState<any[]>([
    ["FPS", "FPS"],
  ]);

  const treeData = useMemo(() => {
    const dataObj = categorizedEntries;

    return Object.keys(dataObj).map((key) => {
      const data = dataObj[key];
      return {
        title: key,
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
  }, [hasChangedEntries]);
  const [recordStartTimestamp, setRecordStartTimestamp] = useState(0);
  const [fileName, setFileName] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const onCheck = useCallback(
    (checkedKeys: any) => {
      if (checkedKeys.length > 1) {
        const category1 = checkedKeys[0].split("#")[0];
        for (let i = 1; i < checkedKeys.length; i++) {
          const category2 = checkedKeys[i].split("#")[0];
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
  const [nameInputModalOpen, setNameInputModalOpen] = useState(false);

  return (
    <aside className="render-statistics" style={asideStyle}>
      <div className="resize-section" onMouseDown={handleMouseDown} />
      <h2 className="header">Render statistics</h2>
      <Flex gap="10px" wrap justify="center">
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <Space>
            <SearchOutlined />
            Analyze data
          </Space>
        </Button>
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "From 1 minute ago",
                onClick: () => {
                  setRecordStartTimestamp(Date.now() - 60000);
                  setNameInputModalOpen(true);
                },
              },
              {
                key: "2",
                label: "From 5 minutes ago",
                onClick: () => {
                  setRecordStartTimestamp(Date.now() - 5 * 60000);
                  setNameInputModalOpen(true);
                },
              },
              {
                key: "3",
                label: "From 10 minutes ago",
                onClick: () => {
                  setRecordStartTimestamp(Date.now() - 10 * 60000);
                  setNameInputModalOpen(true);
                },
              },
              {
                key: "4",
                label: "From 15 minutes ago",
                onClick: () => {
                  setRecordStartTimestamp(Date.now() - 15 * 60000);
                  setNameInputModalOpen(true);
                },
              },
              {
                key: "5",
                label: "All time",
                onClick: () => {
                  setRecordStartTimestamp(Date.now() - Number.MAX_SAFE_INTEGER);
                  setNameInputModalOpen(true);
                },
              },
            ],
          }}
          trigger={["click"]}
          disabled={!isAdmin}
        >
          <Button>
            <Space>
              <SaveOutlined />
              Save data
              <CaretDownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <div>
          <Button
            style={{
              width: "250px",
            }}
            icon={<PlusCircleOutlined />}
            onClick={() => {
              setShowNewChartModal(!showNewChartModal);

              if (!selectedKeys || selectedKeys.length === 0) {
                return;
              }

              const mainCategory = selectedKeys[0].split("#")[0];
              setChosenCategories([
                ...chosenCategories,
                [
                  mainCategory,
                  ...selectedKeys.map((key: string) => key.split("#")[1]),
                ],
              ]);

              setSelectedKeys([]);
            }}
          >
            Add new chart
          </Button>
          <div
            style={{
              opacity: showNewChartModal ? 1 : 0,
              position: "absolute",
              zIndex: 100,
              width: 250,
              backgroundColor: "white",
              transition: "opacity 0.3s",
              borderRadius: 5,
            }}
          >
            <Tree
              checkable
              checkedKeys={selectedKeys}
              onCheck={onCheck}
              treeData={treeData}
            />
          </div>
        </div>
      </Flex>
      <div className="scrollable-content">
        {chosenCategories.map((categories, index) => {
          const category = categories[0];
          const categoryEntries = categories.slice(1);

          if (!categorizedEntries[category]) {
            return;
          }

          return (
            <Chart
              key={index}
              index={index}
              data={categorizedEntries[category]}
              categoriesToDisplay={categoryEntries}
              ylabel={category}
              setChosenCategories={setChosenCategories}
            />
          );
        })}
        <div className="toggle-button close-button" onClick={toggleAside}>
          <LeftOutlined
            className="close-button-icon"
            style={closeButtonStyle}
          />
        </div>
      </div>
      <NamePrompt
        setFileName={setFileName}
        isModalOpen={nameInputModalOpen}
        handleOk={() => {
          setNameInputModalOpen(false);
          let tmpFileName = fileName;
          if (tmpFileName === "") {
            tmpFileName = getFormattedDateTime();
          }

          console.log(
            "Record start timestamp",
            Date.now() - recordStartTimestamp
          );
          const myData = getFilteredData(Date.now() - recordStartTimestamp);

          downloadCSV(myData, tmpFileName + ".csv");
          storeFilteredDataToSessionStorage(myData, tmpFileName);
        }}
      />
      <ChartAnalysis
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </aside>
  );
}

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./PathTracerSettings.css";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Flex,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Slider,
  Space,
  Tooltip,
} from "antd";
import {
  CaretDownOutlined,
  DownloadOutlined,
  ExportOutlined,
  ImportOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ImageResolutionInput from "./ImageResolutionInput";
import config from "../../config/config";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import SettingChangeButton from "./SettingChangeButton";
import DoubleValueInput from "./DoubleValueInput";
import TripleValueInput from "./TripleValueInput";
import useProtobufTypes from "../../hooks/useProtobufTypes";

function NumberInput({
  inputValue,
  setInputValue,
  updateRendererParameter,
  parameterKey,
  disabled = false,
  showSettingChangeButton = true,
}: {
  inputValue: number;
  setInputValue: (value: number) => void;
  updateRendererParameter: (parameterKey: string, value: any) => void;
  parameterKey: string;
  disabled?: boolean;
  showSettingChangeButton?: boolean;
}) {
  const [prevValue, setPrevValue] = useState(inputValue);
  const [value, setValue] = useState(inputValue);
  const { RendererEvent } = useProtobufTypes();

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  return (
    <Space.Compact>
      <InputNumber
        className="number-input"
        min={1}
        value={value}
        onChange={(value) => value && setValue(value)}
        disabled={disabled}
      />
      {showSettingChangeButton && (
        <SettingChangeButton
          value={value}
          prevValue={prevValue}
          onClick={() => {
            // @ts-ignore
            const message = RendererEvent.create({
              // @ts-ignore
              type: RendererEvent.Type[parameterKey],
              numberValue: value,
            });
            updateRendererParameter(parameterKey, message);
            setPrevValue(value);
            setInputValue(value);
          }}
          disabled={disabled}
        />
      )}
    </Space.Compact>
  );
}

export default function PathTracerSettings() {
  const { sendRawMessage } = useWebSocketConnection();
  const { jobId, isAdmin } = useContext(JobSettingsContext);
  const [asideStyle, setAsideStyle] = useState({ left: 0 });
  const pathTracerParams = useContext(PathTracerParamsContext);
  const [isUploading, setIsUploading] = useState(false);
  const closeButtonStyle = useMemo(
    () => ({
      transform: `rotate(${asideStyle.left === 0 ? 0 : 180}deg)`,
      right: asideStyle.left === 0 ? 0 : "-2.5rem",
    }),
    [asideStyle]
  );
  const { Event, CameraEvent, RendererEvent } = useProtobufTypes();

  const toggleAside = useCallback(() => {
    setAsideStyle((prev) => ({
      left: prev.left === 0 ? -360 : 0,
    }));
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    // Append all files to same FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `${config.HTTP_SERVER_URL}/upload?jobId=${jobId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        message.error("Upload failed - server error");
        return;
      }

      message.success("Upload successful!");

      // @ts-ignore
      const newMessage = RendererEvent.create({
        // @ts-ignore
        type: RendererEvent.Type.LOAD_UPLOADED_SCENE,
      });
      updateRendererParameter(
        "LOAD_UPLOADED_SCENE",
        // @ts-ignore
        RendererEvent.encode(newMessage).finish()
      );
    } catch (error) {
      message.error("Upload failed - network error");
      console.error(
        "Failed files:",
        Array.from(files).map((file) => ({
          name: file.name,
          success: false,
        }))
      );
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  const updateRendererParameter = useCallback(
    (parameterKey: string, value: any) => {
      // TODO: improve this - do not split string + move those parameters
      if (parameterKey === "PITCH_YAW" || parameterKey === "SCENE_POSITION") {
        let eventData = {};
        switch (parameterKey) {
          case "PITCH_YAW":
            const [pitch, yaw] = value.split("#");
            eventData = {
              // @ts-ignore
              type: CameraEvent.Type.PITCH_YAW,
              rotation: {
                pitch: Number(pitch),
                yaw: Number(yaw),
              },
            };
            break;
          case "SCENE_POSITION":
            const [x, y, z] = value.split("#");
            eventData = {
              // @ts-ignore
              type: CameraEvent.Type.SCENE_POSITION,
              position: { x: Number(x), y: Number(y), z: Number(z) },
            };
            break;
          default:
            return;
        }
        // @ts-ignore
        const cameraEventMessage = CameraEvent.create(eventData);
        // @ts-ignore
        const message = Event.create({
          // @ts-ignore
          type: Event.EventType.CAMERA_EVENT,
          camera: cameraEventMessage,
        });
        // @ts-ignore
        sendRawMessage(Event.encode(message).finish());
        return;
      }
      // @ts-ignore
      const message = Event.create({
        // @ts-ignore
        type: Event.EventType.RENDERER_EVENT,
        renderer: value,
      });
      // @ts-ignore
      sendRawMessage(Event.encode(message).finish());
    },
    [sendRawMessage, Event, CameraEvent]
  );

  const setLoadBalancingAlgorithm = useCallback(
    (value: string) => {
      // @ts-ignore
      const message = RendererEvent.create({
        // @ts-ignore
        type: RendererEvent.Type.LOAD_BALANCING_ALGORITHM,
        // @ts-ignore
        loadBalancingAlgorithm: RendererEvent.LoadBalancingAlgorithm[value],
      });
      updateRendererParameter("LOAD_BALANCING_ALGORITHM", message);
      pathTracerParams.setLoadBalancingAlgorithm(value);
    },
    [updateRendererParameter, pathTracerParams, RendererEvent]
  );

  const setShowTaskGrid = useCallback(() => {
    const showTaskGrid = !pathTracerParams.showTaskGrid;
    pathTracerParams.setShowTaskGrid(showTaskGrid);
    // @ts-ignore
    const message = RendererEvent.create({
      // @ts-ignore
      type: RendererEvent.Type.SHOW_TASK_GRID,
      booleanValue: showTaskGrid,
    });
    updateRendererParameter("SHOW_TASK_GRID", message);
  }, [updateRendererParameter, pathTracerParams, RendererEvent]);

  const loadSettingsFromJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const content = await file.text();
      try {
        pathTracerParams.importStateFromJSON(content);
      } catch (err) {
        console.error("Failed to parse settings file:", err);
      } finally {
        input.remove();
      }
    };

    input.click();
  }, [pathTracerParams]);

  const saveSettingsToJSON = useCallback(() => {
    const json = pathTracerParams.exportStateToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [pathTracerParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <aside className="path-tracer-settings" style={asideStyle}>
      <div className="scrollable-content">
        <Flex align="center" gap="large" vertical>
          <h2>Path tracer settings</h2>
          <Form layout="vertical">
            <Form.Item
              label="Scheduling algorithm"
              tooltip="Algorithm used to schedule the rendering tasks."
            >
              <Select
                placeholder="Select a scheduling algorithm"
                options={config.LOAD_BALANCING_ALGORITHMS}
                defaultValue={config.DEFAULT_LOAD_BALANCING_ALGORITHM}
                onChange={setLoadBalancingAlgorithm}
                value={pathTracerParams.loadBalancingAlgorithm}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Flex align="center" justify="space-around">
              <Form.Item
                label="K parameter"
                tooltip="K parameter is representing the maximum number of tasks allowed within a single horizontal strip"
              >
                <NumberInput
                  inputValue={pathTracerParams.kParam}
                  setInputValue={pathTracerParams.setKParam}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="K_PARAMETER"
                  disabled={
                    !isAdmin ||
                    pathTracerParams.loadBalancingAlgorithm !== "DSFL"
                  }
                />
              </Form.Item>
              <Form.Item
                style={{
                  // TODO: fix styles (this is a hotfix)
                  marginTop: 30,
                }}
              >
                <Checkbox
                  onChange={setShowTaskGrid}
                  checked={pathTracerParams.showTaskGrid}
                  disabled={!isAdmin}
                >
                  Show task grid
                </Checkbox>
                <Tooltip title="Show the grid of tasks in the scene">
                  <QuestionCircleOutlined style={{ color: "#858585" }} />
                </Tooltip>
              </Form.Item>
            </Flex>
            <Divider />
            <Flex align="space-around" justify="space-around" wrap>
              <Form.Item
                label="GPU number"
                tooltip="Number of GPUs used for rendering."
              >
                <NumberInput
                  inputValue={pathTracerParams.gpuNumber}
                  setInputValue={pathTracerParams.setGpuNumber}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="GPU_NUMBER"
                  disabled={!isAdmin}
                />
              </Form.Item>
              {/* <Form.Item
                label="Streams per GPU"
                tooltip="Streams allow for asynchronous execution of operations on the GPU, enabling overlapping computation and communication to improve performance."
              >
                <NumberInput
                  inputValue={pathTracerParams.streamsPerGpu}
                  setInputValue={pathTracerParams.setStreamsPerGpu}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="STREAMS_PER_GPU"
                  disabled={!isAdmin}
                />
              </Form.Item> */}
              <Form.Item
                label="Samples per pixel"
                tooltip="The number of light paths or rays traced per pixel during the rendering process."
              >
                <NumberInput
                  inputValue={pathTracerParams.samplesPerPixel}
                  setInputValue={pathTracerParams.setSamplesPerPixel}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="SAMPLES_PER_PIXEL"
                  disabled={!isAdmin}
                />
              </Form.Item>
              <Form.Item
                label="Recursion depth"
                tooltip="The maximum number of times a ray can bounce or reflect within a scene before the algorithm terminates that path."
              >
                <NumberInput
                  inputValue={pathTracerParams.recursionDepth}
                  setInputValue={pathTracerParams.setRecursionDepth}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="RECURSION_DEPTH"
                  disabled={!isAdmin}
                />
              </Form.Item>
            </Flex>
            {/* <Form.Item
              label="Thread block size"
              tooltip="The size of single Thread Block in the Grid."
            >
              <DoubleValueInput
                keyName="THREAD_BLOCK_SIZE"
                firstValue={pathTracerParams.threadBlockSizeX}
                prevFirstValue={pathTracerParams.prevThreadBlockSizeX}
                setFirstValue={pathTracerParams.setThreadBlockSizeX}
                setPrevFirstValue={pathTracerParams.setPrevThreadBlockSizeX}
                secondValue={pathTracerParams.threadBlockSizeY}
                setSecondValue={pathTracerParams.setThreadBlockSizeY}
                prevSecondValue={pathTracerParams.prevThreadBlockSizeY}
                setPrevSecondValue={pathTracerParams.setPrevThreadBlockSizeY}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item> */}
            <Divider
              style={{
                marginTop: "10px",
              }}
            />
            <Form.Item label="Image resolution (width x height)">
              <ImageResolutionInput
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Form.Item label="Camera position (x, y, z)">
              <TripleValueInput
                keyName="SCENE_POSITION"
                firstValue={pathTracerParams.scenePositionX}
                setFirstValue={pathTracerParams.setScenePositionX}
                secondValue={pathTracerParams.scenePositionY}
                setSecondValue={pathTracerParams.setScenePositionY}
                thirdValue={pathTracerParams.scenePositionZ}
                setThirdValue={pathTracerParams.setScenePositionZ}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
                separator=","
                minValue={null}
              />
            </Form.Item>
            <Form.Item label="Pitch and yaw (pitch, yaw)">
              <DoubleValueInput
                keyName="PITCH_YAW"
                firstValue={pathTracerParams.pitch}
                setFirstValue={pathTracerParams.setPitch}
                secondValue={pathTracerParams.yaw}
                setSecondValue={pathTracerParams.setYaw}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
                separator=","
                minValue={null}
              />
            </Form.Item>
            <Form.Item label="Camera move speed">
              <Row>
                <Col span={12}>
                  <Slider
                    min={0}
                    max={100}
                    onChange={pathTracerParams.setMoveSpeed}
                    value={pathTracerParams.moveSpeed}
                    step={0.1}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ margin: "0 16px" }}
                    step={0.1}
                    value={pathTracerParams.moveSpeed}
                    // @ts-ignore
                    onChange={pathTracerParams.setMoveSpeed}
                  />
                </Col>
              </Row>
            </Form.Item>
            <Form.Item>
              <Flex align="center" justify="center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={triggerFileInput}
                  loading={isUploading}
                  icon={<SettingOutlined />}
                  disabled={!isAdmin}
                >
                  Load scene
                </Button>
              </Flex>
            </Form.Item>
            <Divider />
            <Form.Item>
              <Flex align="center" justify="center" gap="20px">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "1",
                        icon: <ImportOutlined />,
                        label: "Load .json settings",
                        onClick: loadSettingsFromJSON,
                      },
                      {
                        key: "2",
                        label: "Save settings to .json",
                        icon: <ExportOutlined />,
                        onClick: saveSettingsToJSON,
                      },
                    ],
                  }}
                  trigger={["click"]}
                  disabled={!isAdmin}
                >
                  <Button className="primary-button">
                    <Space>
                      <UploadOutlined />
                      Import / Export settings
                      <CaretDownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Flex>
            </Form.Item>
            <Flex align="center" justify="center" gap="20px">
              <Form.Item>
                <Button
                  className="primary-button"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    // @ts-ignore
                    const message = RendererEvent.create({
                      // @ts-ignore
                      type: RendererEvent.Type.DOWNLOAD_SCENE_SNAPSHOT,
                    });
                    updateRendererParameter("RENDERER_PARAMETER", message);
                  }}
                  disabled={!isAdmin}
                >
                  Download current view
                </Button>
              </Form.Item>
            </Flex>
          </Form>
        </Flex>
        <div className="toggle-button close-button" onClick={toggleAside}>
          <LeftOutlined
            className="close-button-icon"
            style={closeButtonStyle}
          />
        </div>
      </div>
    </aside>
  );
}

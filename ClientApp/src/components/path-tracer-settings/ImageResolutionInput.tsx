import { useContext, useState } from "react";
import { InputNumber, Flex, Space } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import "./ImageResolutionInput.css";
import SettingChangeButton from "./SettingChangeButton";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import useProtobufTypes from "../../hooks/useProtobufTypes";

export default function ImageResolutionInput({
  updateRendererParameter,
  disabled,
}: {
  updateRendererParameter: (key: string, value: any) => void;
  disabled?: boolean;
}) {
  const pathTracerParams = useContext(PathTracerParamsContext);
  const [aspectRatio, setAspectRatio] = useState(
    pathTracerParams.width / pathTracerParams.height
  );
  const [shouldMaintainRatio, setShouldMaintainRatio] = useState(true);
  const [internalWidth, setInternalWidth] = useState(pathTracerParams.width);
  const [internalHeight, setInternalHeight] = useState(pathTracerParams.height);

  const handleWidthChange = (value: any) => {
    setInternalWidth(value);
    if (shouldMaintainRatio) {
      setInternalHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: any) => {
    setInternalHeight(value);
    if (shouldMaintainRatio) {
      setInternalWidth(Math.round(value * aspectRatio));
    }
  };

  const handleMaintainRatio = () => {
    if (shouldMaintainRatio) {
      setShouldMaintainRatio(false);
    } else {
      setShouldMaintainRatio(true);
      setAspectRatio(internalWidth / internalHeight);
    }
  };

  const { RendererEvent } = useProtobufTypes();

  return (
    <Flex align="space-around" justify="center" gap="15px">
      <Space direction="vertical" align="center">
        <Flex align="center" gap="5px">
          <InputNumber
            min={1}
            value={internalWidth}
            onChange={handleWidthChange}
            disabled={disabled}
          />
          <div className="maintain-ratio-button" onClick={handleMaintainRatio}>
            {shouldMaintainRatio ? <LockOutlined /> : <UnlockOutlined />}
          </div>
          <InputNumber
            min={1}
            value={internalHeight}
            onChange={handleHeightChange}
            disabled={disabled}
          />
        </Flex>
      </Space>
      <SettingChangeButton
        value={`${internalWidth}x${internalHeight}`}
        prevValue={`${pathTracerParams.prevWidth}x${pathTracerParams.prevHeight}`}
        onClick={() => {
          // @ts-ignore
          const message = RendererEvent.create({
            // @ts-ignore
            type: RendererEvent.Type.IMAGE_RESOLUTION,
            blockValue: {
              x: internalWidth,
              y: internalHeight,
            },
          });
          updateRendererParameter("IMAGE_RESOLUTION", message);
          pathTracerParams.setPrevWidth(internalWidth);
          pathTracerParams.setPrevHeight(internalHeight);
          pathTracerParams.setWidth(internalWidth);
          pathTracerParams.setHeight(internalHeight);
        }}
        disabled={disabled}
      />
    </Flex>
  );
}

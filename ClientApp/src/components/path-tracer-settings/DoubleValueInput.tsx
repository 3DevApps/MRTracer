import { Flex, InputNumber } from "antd";
import React, { useEffect } from "react";
import SettingChangeButton from "./SettingChangeButton";
import useProtobufTypes from "../../hooks/useProtobufTypes";

export default function DoubleValueInput({
  firstValue,
  setFirstValue,
  prevFirstValue,
  setPrevFirstValue,
  secondValue,
  setSecondValue,
  prevSecondValue,
  setPrevSecondValue,
  updateRendererParameter,
  disabled,
  keyName,
  separator = "X",
  minValue = 1,
}: {
  firstValue: number;
  setFirstValue: (value: number) => void;
  prevFirstValue?: number;
  setPrevFirstValue?: (value: number) => void;
  secondValue: number;
  setSecondValue: (value: number) => void;
  prevSecondValue?: number;
  setPrevSecondValue?: (value: number) => void;
  updateRendererParameter: (key: string, value: any) => void;
  disabled: boolean;
  keyName: string;
  separator?: string;
  minValue?: number | null;
}) {
  const [internalFirstValue, setIntarnalFirstValue] =
    React.useState(firstValue);
  const [internalSecondValue, setInternalSecondValue] =
    React.useState(secondValue);
  const { RendererEvent } = useProtobufTypes();

  useEffect(() => {
    setIntarnalFirstValue(firstValue);
    setInternalSecondValue(secondValue);
  }, [firstValue, secondValue]);

  return (
    <Flex align="space-around" justify="center" gap="15px">
      <Flex align="center" gap="5px">
        <InputNumber
          min={minValue === null ? undefined : minValue}
          className="thread-block-size-input"
          onChange={(value) => value && setIntarnalFirstValue(value)}
          value={internalFirstValue}
          disabled={disabled}
        />
        <b>{separator}</b>
        <InputNumber
          min={minValue === null ? undefined : minValue}
          className="thread-block-size-input"
          onChange={(value) => value && setInternalSecondValue(value)}
          value={internalSecondValue}
          disabled={disabled}
        />
      </Flex>
      <SettingChangeButton
        value={`${internalFirstValue}x${internalSecondValue}`}
        prevValue={
          prevFirstValue &&
          prevSecondValue &&
          `${prevFirstValue}x${prevSecondValue}`
        }
        onClick={() => {
          // @ts-ignore
          const message = RendererEvent.create({
            // @ts-ignore
            type: RendererEvent.Type[keyName],
            blockValue: {
              x: internalFirstValue,
              y: internalSecondValue,
            },
          });
          updateRendererParameter(
            keyName,
            `${internalFirstValue}#${internalSecondValue}`
          );
          setPrevFirstValue?.(internalFirstValue);
          setPrevSecondValue?.(internalSecondValue);
          setFirstValue(internalFirstValue);
          setSecondValue(internalSecondValue);
        }}
        disabled={disabled}
      />
    </Flex>
  );
}

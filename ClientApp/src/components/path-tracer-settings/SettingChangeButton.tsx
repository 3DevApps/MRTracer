import { Button } from "antd";
import { useEffect, useState } from "react";
import "./SettingChangeButton.css";

const BUTTON_RED = "#ff0021";

export default function SettingChangeButton({
  value,
  prevValue,
  onClick,
  disabled = false,
}: {
  value: any;
  prevValue: any;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [style, setStyle] = useState<{
    backgroundColor: string | undefined;
  }>({ backgroundColor: undefined });

  useEffect(() => {
    if (prevValue === undefined) {
      return;
    }
    setStyle({
      backgroundColor: value === prevValue ? undefined : BUTTON_RED,
    });
  }, [value, prevValue]);

  return (
    <Button
      className="setting-change-button"
      style={style}
      onClick={onClick}
      type="primary"
      disabled={disabled}
    >
      {style.backgroundColor === BUTTON_RED ? "\u276f" : "\u2713"}
    </Button>
  );
}

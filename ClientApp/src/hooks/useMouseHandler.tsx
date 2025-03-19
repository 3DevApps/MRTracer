import { MouseEventHandler, useCallback, useEffect, useState } from "react";

export function useMouseHandler(
  mouseMoveHandler: MouseEventHandler<HTMLElement>
) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleMouseDown = useCallback(() => setIsMouseDown(true), []);
  const handleMouseUp = useCallback(() => setIsMouseDown(false), []);
  const handleMouseMove: MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (!isMouseDown) {
        return;
      }
      mouseMoveHandler(e);
    },
    [isMouseDown, mouseMoveHandler]
  );

  useEffect(() => {
    if (isMouseDown) {
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMouseDown, handleMouseUp]);

  return { handleMouseDown, handleMouseMove };
}

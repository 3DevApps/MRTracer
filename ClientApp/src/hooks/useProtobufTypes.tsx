import { useState, useEffect } from "react";
import protobufjs from "protobufjs";
import jsonFile from "../../proto/genproto/bundle.json";

export interface ProtobufInterfaces {
  Event: protobufjs.Type | null;
  CameraEvent: protobufjs.Type | null;
  RendererEvent: protobufjs.Type | null;
}

const useProtobufTypes = () => {
  const [interfaces, setInterfaces] = useState<ProtobufInterfaces>({
    Event: null,
    CameraEvent: null,
    RendererEvent: null,
  });

  useEffect(() => {
    const root = protobufjs.Root.fromJSON(jsonFile);

    const Event = root.lookupType("Event");
    const CameraEvent = root.lookupType("CameraEvent");
    const RendererEvent = root.lookupType("RendererEvent");

    setInterfaces({ Event, CameraEvent, RendererEvent });
  }, []);

  return interfaces;
};

export default useProtobufTypes;

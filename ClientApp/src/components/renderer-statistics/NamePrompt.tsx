import { Modal, Input } from "antd";
import { useState } from "react";

export default function NamePrompt({
  isModalOpen,
  setFileName,
  handleOk,
}: any) {
  const [fileName, internalFileName] = useState("");

  return (
    <Modal title="Input file name" open={isModalOpen} onOk={handleOk}>
      <Input
        placeholder="File name"
        type="text"
        value={fileName}
        onChange={(e) => {
          internalFileName(e.target.value);
          setFileName(e.target.value);
        }}
      />
    </Modal>
  );
}

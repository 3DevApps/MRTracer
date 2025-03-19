import { useCallback, useState } from "react";
import "./Header.css";
import { GithubOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { Typography } from "antd";

const { Title } = Typography;

export default function Header() {
  const handleGithubClick = useCallback(() => {
    window.open("https://github.com/3DevApps/multi-gpu-path-tracer");
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="header-wrapper">
      <header className="header">Multi-GPU Path Tracer</header>
      <div className="header-buttons-wrapper">
        <QuestionCircleOutlined onClick={openModal} className="header-button" />
        <GithubOutlined onClick={handleGithubClick} className="header-button" />
      </div>
      <Modal
        title="Multi-GPU Path Tracer"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <p>
          Engineering thesis project tackling raytracing in remote multi-gpu
          environment.
        </p>
        <br />
        <Title level={5}>How to Use This Tool</Title>
        <ol
          style={{
            listStyle: "number inside",
          }}
        >
          <li>
            <strong>Load the Scene:</strong> Initialize and load the environment
            you wish to explore.
          </li>
          <li>
            <strong>Modify Default Path Tracer Settings:</strong> Customize the
            path tracer settings to suit your preferences and needs.
          </li>
          <li>
            <strong>Navigating the Scene:</strong>
          </li>
          <ul>
            <li>
              <em>Rotate the Camera:</em> Click and drag the mouse to adjust the
              camera view.
            </li>
            <li>
              <em>Move the Camera:</em> Use <kbd>W</kbd>, <kbd>A</kbd>,{" "}
              <kbd>S</kbd>, and <kbd>D</kbd> keys for forward, left, backward,
              and right movements, respectively.
            </li>
            <li>
              <em>Vertical Movement:</em> Use <kbd>Q</kbd> and <kbd>E</kbd> keys
              to move the camera up and down.
            </li>
            <li>
              <em>Adjust Camera FOV:</em> Press <kbd>CTRL</kbd> + <kbd>[</kbd>{" "}
              or <kbd>CTRL</kbd> + <kbd>]</kbd> to modify the camera's field of
              view.
            </li>
          </ul>
        </ol>
        <br />
        <p>Authors: Patryk Klatka, Wojciech Łoboda, Bartłomiej Tempka</p>
      </Modal>
    </div>
  );
}

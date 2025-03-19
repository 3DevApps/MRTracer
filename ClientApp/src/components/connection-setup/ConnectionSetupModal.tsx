import { Button, Form, Input, Modal, Radio } from "antd";
import { useState } from "react";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";

const DEFAULT_SCRIPT = `#!/bin/bash
# This function is responsible for initializing and running the rendering program 
# on a remote environment. Here you should include all the necessary commands to
# start the program. In this function you can return, for example, the id of the
# process that is running the program, so that you can later stop it. 
start_program() {
    jobId=$1
    echo "Starting program..."
    return 0
}

# This function is responsible for stopping the program that was started by the
# start_program function. Here you should include all the necessary commands to
# stop the program. The id parameter of this function is the id of the process
# that is running the program, and that was returned by the start_program function.
stop_program() {
    jobId=$1
    echo "Stopping program $jobId..." 
}`;

export default function ConnectionSetupModal({ isModalOpen }: any) {
  const [passwordType, setPasswordType] = useState("account");
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [credential, setCredential] = useState("");
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const { sendMessage } = useWebSocketConnection();
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    sendMessage([
      "CONNECTION_DETAILS",
      encodeURIComponent(
        JSON.stringify({
          ...values,
          authenticationMethod: passwordType,
          default: false,
        })
      ),
    ]);
  };

  return (
    <Modal
      title="Connection setup"
      open={isModalOpen}
      closable={true}
      footer={null}
      maskClosable={false}
      width={900}
      style={{
        minWidth: "900px",
        marginTop: "-90px",
        paddingTop: "20px",
      }}
    >
      <p>
        Before connecting, please make sure that ~/connectionScript.sh is
        available on the remote environment. You can download the template
        script
        <span
          style={{
            color: "#1890ff",
            cursor: "pointer",
          }}
          onClick={() => {
            const blob = new Blob([script], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "connectionScript.sh";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          &nbsp;here.
        </span>
      </p>
      <Button
        title="Load from file"
        type="primary"
        className="float-right"
        style={{
          marginBottom: "20px",
          marginTop: "10px",
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";

          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const content = await file.text();
            try {
              const settings = JSON.parse(content);
              console.log(
                "Settings loaded from file:",
                settings,
                settings.host
              );
              setHost(settings.host);
              console.log("settings.username", settings.host, host);
              setUsername(settings.username);
              setPasswordType(settings.authenticationMethod);
              setCredential(settings.credential);
              setScript(settings.script);

              form.setFieldsValue({
                host: settings.host,
                username: settings.username,
                authenticationMethod: settings.authenticationMethod,
                credential: settings.credential,
                script: settings.script,
              });
            } catch (err) {
              console.error("Failed to parse settings file:", err);
            } finally {
              input.remove();
            }
          };
          input.click();
        }}
      >
        Load from file
      </Button>

      <Button
        title="Save to file"
        type="default"
        className="float-right"
        style={{ marginBottom: "20px", marginTop: "10px", marginLeft: "20px" }}
        onClick={() => {
          const settings = {
            host,
            username,
            authenticationMethod: passwordType,
            credential,
            script,
          };
          const blob = new Blob([JSON.stringify(settings)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "connection-config.json";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Save to file
      </Button>

      <Form
        onFinish={handleSubmit}
        layout="vertical"
        className="p-4 bg-gray-100 rounded-lg"
        form={form}
      >
        <Form.Item
          name="host"
          label="SSH Host"
          shouldUpdate
          rules={[{ required: true, message: "Please enter host" }]}
        >
          <Input
            placeholder="Enter SSH host (e.g., 192.168.1.100)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Authentication Method" name="authenticationMethod">
          <Radio.Group
            value={passwordType}
            onChange={(e) => setPasswordType(e.target.value)}
            defaultValue="account"
          >
            <Radio value="account">Account Password</Radio>
            <Radio value="sshKey">SSH Private Key</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="credential"
          label={passwordType === "account" ? "Password" : "SSH Private Key"}
          rules={[{ required: true, message: "Please enter credentials" }]}
        >
          {passwordType === "account" ? (
            <Input.Password
              placeholder="Enter account password"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
            />
          ) : (
            <Input.TextArea
              rows={4}
              placeholder="Paste SSH private key"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="default"
            className="mr-2"
            onClick={() => {
              sendMessage([
                "CONNECTION_DETAILS",
                JSON.stringify({
                  default: true,
                }),
              ]);
            }}
          >
            Use Default Environment
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              marginLeft: 20,
            }}
          >
            Connect
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

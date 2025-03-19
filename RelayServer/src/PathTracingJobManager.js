const { NodeSSH } = require("node-ssh");
const WebSocketMessageUtils = require("./WebSocketMessageUtils");

const JOB_DISCONNECT_TIMEOUT = 20000;

const DEFAULT_SCRIPT = `
!#/bin/bash
start_program() {
    jobId=$1
    result=$(sbatch ~/multi-gpu-path-tracer/scripts/run_job.sh $jobId)
    internalJobId=$(echo $result | awk '{print $4}')
    return $internalJobId
}
stop_program() {
    jobId=$1
    scancel $jobId
}
`;

class PathTracingJobManager {
  constructor() {
    this.jobs = new Map();
    this.jobDisconnectTimeouts = {};
  }

  registerJob(jobId) {
    if (!this.jobs.has(jobId)) {
      this.jobs.set(jobId, {});
      return true;
    }
    return JSON.stringify(this.jobs.get(jobId)) === "{}";
  }

  async initializeConnection(client, connectionDetails) {
    const jobId = client._jobId;
    const jobObj = this.jobs.get(jobId);
    if (Object.keys(jobObj).length !== 0) {
      return;
    }

    const ssh = new NodeSSH();
    try {
      if (connectionDetails.default) {
        await ssh.connect({
          host: process.env.SSH_HOST,
          username: process.env.SSH_USERNAME,
          password: process.env.SSH_PASSWORD,
        });
      } else {
        if (connectionDetails.authenticationMethod === "sshKey") {
          await ssh.connect({
            host: connectionDetails.host,
            username: connectionDetails.username,
            privateKey: connectionDetails.credential,
          });
        } else {
          await ssh.connect({
            host: connectionDetails.host,
            username: connectionDetails.username,
            password: connectionDetails.credential,
          });
        }
      }
    } catch (err) {
      client.send(
        WebSocketMessageUtils.encodeMessage([
          "NOTIFICATION",
          "ERROR",
          "CONNECTION_ERROR",
          "Connection failed",
        ])
      );
      return;
    }

    // Read script in the remote server
    let result;
    try {
      result = await ssh.execCommand("cat ~/connectionScript.sh");
    } catch (err) {
      client.send(
        WebSocketMessageUtils.encodeMessage([
          "NOTIFICATION",
          "ERROR",
          "SCRIPT_ERROR",
          "Failed to read script",
        ])
      );
      return;
    }

    this.jobs.set(jobId, {
      ssh,
      script: connectionDetails.default ? DEFAULT_SCRIPT : result,
    });

    client._shouldConfigureJob = false;
    client.send(
      WebSocketMessageUtils.encodeMessage([
        "CONNECTION_DETAILS_OK",
        "Connection established",
      ])
    );

    this.dispatchJob(client);
  }

  async dispatchJob(client) {
    const jobId = client._jobId;
    if (this.jobDisconnectTimeouts[jobId]) {
      clearTimeout(this.jobDisconnectTimeouts[jobId]);
      delete this.jobDisconnectTimeouts[jobId];
      return;
    }
    const jobObj = this.jobs.get(jobId);
    const result = await jobObj?.ssh?.execCommand(
      `${jobObj.script}
      start_program ${jobId}`
    );
    const internalJobId = result.stdout;
    this.jobs.set(jobId, { ...jobObj, internalJobId });

    client.send(
      WebSocketMessageUtils.encodeMessage([
        "NOTIFICATION",
        "LOADING",
        "JOB_INIT",
        "Initiating job...",
      ])
    );
  }

  async killJob(jobId) {
    if (!this.jobs.has(jobId) || this.jobDisconnectTimeouts[jobId]) {
      return;
    }
    this.jobDisconnectTimeouts[jobId] = setTimeout(() => {
      const jobObj = this.jobs.get(jobId);
      jobObj?.ssh?.execCommand(`
        ${jobObj.script}
        stop_program ${jobObj.internalJobId}`);
      this.jobs.delete(jobId);
      delete this.jobDisconnectTimeouts[jobId];
    }, JOB_DISCONNECT_TIMEOUT);
  }

  async sendFile(jobId, filePath, fileName) {
    const jobObj = this.jobs.get(jobId);
    try {
      await jobObj?.ssh?.putFiles([
        {
          local: filePath,
          remote: `files/f${fileName}`,
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = PathTracingJobManager;

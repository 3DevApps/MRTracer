class WebSocketClientHandler {
  constructor() {
    this.clients = {};
    this.clientJobMap = new Map();
    this.pathTracingClients = {};
    this.pathTracingClientJobMap = new Map();
  }

  getClients(jobId) {
    return this.clients[jobId] || null;
  }

  getPathTracingClients(jobId) {
    return this.pathTracingClients[jobId] || null;
  }

  getClientJobId(client) {
    return this.clientJobMap.get(client) || null;
  }

  addClientToJob(jobId, client) {
    if (!this.clients[jobId]) {
      this.clients[jobId] = [];
    }
    if (!this.clientJobMap.has(client)) {
      this.clients[jobId].push(client);
      this.clientJobMap.set(client, jobId);
    }
  }

  isAdmin(jobId, client) {
    if (!this.clients[jobId] || this.clients[jobId].length === 0) {
      return false;
    }
    return client === this.clients[jobId][0];
  }

  getAdminClient(jobId) {
    return this.clients[jobId] ? this.clients[jobId][0] : null;
  }

  addPathTracingClient(jobId, client) {
    if (!this.pathTracingClients[jobId]) {
      this.pathTracingClients[jobId] = [];
    }
    if (!this.pathTracingClientJobMap.has(client)) {
      this.pathTracingClients[jobId].push(client);
      this.pathTracingClientJobMap.set(client, jobId);
    }
  }

  removeJob(jobId) {
    if (this.clients[jobId]) {
      for (const client of this.clients[jobId]) {
        this.clientJobMap.delete(client);
      }
      delete this.clients[jobId];
    }
  }

  removeClient(client) {
    if (this.clientJobMap.has(client)) {
      this.removeClientFromJob(client);
    } else if (this.pathTracingClientJobMap.has(client)) {
      this.removePathTracingClient(client);
    }
  }

  removeClientFromJob(client) {
    const jobId = this.clientJobMap.get(client);
    if (jobId) {
      this.clients[jobId] = this.clients[jobId].filter((c) => c !== client);
      if (this.clients[jobId].length === 0) {
        delete this.clients[jobId];
      }
      this.clientJobMap.delete(client);
    }
  }

  removePathTracingClient(client) {
    const jobId = this.pathTracingClientJobMap.get(client);
    if (jobId) {
      this.pathTracingClients[jobId] = this.pathTracingClients[jobId].filter(
        (c) => c !== client
      );
      if (this.pathTracingClients[jobId].length === 0) {
        delete this.pathTracingClients[jobId];
      }
      this.pathTracingClientJobMap.delete(client);
    }
  }
}

module.exports = WebSocketClientHandler;

# MRTracer

MRTracer is a real-time path tracer that renders scenes remotely on a selected environment and streams the results to a client application running in the browser.

MRTracer utilizes a GPU-based path tracing implementation using CUDA, requiring the remote rendering environment to be equipped with NVIDIA GPUs with CUDA support.

Rendering results are displayed in the client application within the browser. MRTracer supports multi-GPU rendering and allows users to choose from various load-balancing algorithms based on frame-splitting  to distribute the workload efficiently among devices.

<br/>

<div align="center">
  <img width="700" alt="Client Application Overview" src="https://github.com/user-attachments/assets/e1193a7f-2e7b-4ade-abc1-3438b4895fca" />
  <br/>
  <strong>Client Application Overview</strong>
</div>

---

## Architecture

MRTracer consists of three components: the Client Application, Relay Server, and Compute Node.

- **Client Application** – Runs in the browser, allowing users to choose rendering parameters and select the scene to be rendered. It displays the rendering results and enables users to move the camera around the scene. Additionally, it provides key metrics to evaluate the performance of the rendering algorithm.

- **Relay Server** – Manages connections between Client Application instances and Compute Nodes running in Compute Environments. It initializes the connection to the remote environment selected by the user, starts the Compute Node, and facilitates data transfer between the Compute Node and Client Application, including rendered frames and configuration updates.

- **Compute Node** – Runs in a remote Compute Environment, executing rendering algorithms. It manages and distributes the workload across GPUs while also collecting performance metrics.

<div align="center">
  <img width="700" alt="MRTracer Architecture" src="https://github.com/user-attachments/assets/ed7e823f-9f54-4384-be21-bb6f91ad10c8" />
  <br/>
  <strong>MRTracer Architecture</strong>
</div>

---

## Build

### Compute Node:

```sh
$ cd ./ComputeNode
$ conan profile detect --force
$ conan install . --build=missing --output-folder=build
$ cmake -S . -B build
$ cmake --build build
```

## Usage

MRTracer’s parameters can be configured in the Client Application via the left-side panel. The panel is divided into four sections: **Load Balancing Parameters, Path Tracing Algorithm Parameters, Scene Parameters, and Miscellaneous Settings**.

<div align="center">
  <img width="217" alt="MRTracer Settings Panel" src="https://github.com/user-attachments/assets/25b6ecd9-c9cd-41c0-9024-e785fe157d3f" />
  <br/>
  <strong>MRTracer Settings Panel</strong>
</div>
<br/>
<br/>

The **Render Statistics Panel** on the right side displays real-time metrics essential for evaluating the quality of the rendering process. By default, the panel shows a chart with the **FPS (frames per second)** metric. Users can add additional charts to track desired metrics by clicking the **Add New Chart** button. 

Each chart has:
- **X-axis:** Represents the timestamp of the recorded metric values.
- **Y-axis:** Displays the metric values.

<div align="center">
  <img width="263" alt="MRTracer Render Statistics Panel" src="https://github.com/user-attachments/assets/048ce686-55cb-4a4d-aa89-439eddeb092b" />
  <br/>
  <strong>MRTracer Render Statistics Panel</strong>
</div>
<br/>
<br/>

MRTracer enables the execution of the **Path Tracing algorithm across multiple GPUs**. When the user selects the option to **visualize frame splitting** in the settings, borders will highlight the areas rendered by each device in every frame.

<div align="center">
  <img width="415" alt="image" src="https://github.com/user-attachments/assets/115ea342-2809-4176-b08c-d24ddf6e7db6" />
  <br/>
  <strong>Frame Splitting Visualization</strong>
</div>

---

# MRTracer

MRTracer is a real-time path tracer that renders scenes remotely on a selected environment and streams the results to a client application running in the browser.

MRTracer utilizes a GPU-based path tracing implementation using CUDA, requiring the remote rendering environment, to be equipped with NVIDIA GPUs with CUDA support.

Rendering results are displayed in the client application within the browser. MRTracer supports multi-GPU rendering and allows users to choose from various load-balancing algorithms to distribute the workload efficiently among devices.

<br/>

<figure style="text-align: center;">
  <img width="700" alt="image" src="https://github.com/user-attachments/assets/e1193a7f-2e7b-4ade-abc1-3438b4895fca" />
  <br/>
  <figcaption><strong>Client Application Overview</strong></figcaption>
</figure>

---

## Architecture

MRTracer consists of three components: the Client Application, Relay Server, and Compute Node.

- Client Application – Runs in the browser, allowing users to choose rendering parameters and select the scene to be rendered. It displays the rendering results and enables users to move the camera around the scene. Additionally, it provides key metrics to evaluate the performance of the rendering algorithm.

- Relay Server – Manages connections between Client Application instances and Compute Nodes running in Compute Environments. It initializes the connection to the remote environment selected by the user, starts the Compute Node, and facilitates data transfer between the Compute Node and Client Application, including rendered frames and configuration updates.

- Compute Node – Runs in a remote Compute Environment, executing rendering algorithms. It manages and distributes the workload across GPUs while also collecting performance metrics.

<figure style="text-align: center;">
  <img width="700" alt="image" src="https://github.com/user-attachments/assets/ed7e823f-9f54-4384-be21-bb6f91ad10c8" />
  <br/>
  <figcaption><strong>MRTracer Architecture</strong></figcaption>
</figure>

---

## Build

Compute Node:

```
$ cd ./ComputeNode
$ conan profile detect --force
$ conan install . --build=missing --output-folder=build
$ cmake -S . -B build
$ cmake --build build 
```

Relay Server:

Client Application:

---

## Usage

MRTracer’s parameters can be configured in the Client Application via the left-side panel. The panel is divided into four sections: Load Balancing Parameters, Path Tracing Algorithm Parameters, Scene Parameters, and Miscellaneous Settings.

<figure style="text-align: center;">
  <img width="217" alt="image" src="https://github.com/user-attachments/assets/25b6ecd9-c9cd-41c0-9024-e785fe157d3f" />
  <br/>
  <figcaption><strong>MRTracer Architecture</strong></figcaption>
</figure>

The Render Statistics Panel on the right side displays real-time metrics essential for evaluating the quality of the rendering process. By default, the panel shows a chart with the FPS (frames per second) metric. Users can add additional charts to track desired metrics by clicking the Add New Chart button. On each chart, the x-axis represents the timestamp of the metric values, while the y-axis displays the recorded metric values.

<figure style="text-align: center;">
  <img width="263" alt="image" src="https://github.com/user-attachments/assets/048ce686-55cb-4a4d-aa89-439eddeb092b" />
  <br/>
  <figcaption><strong>MRTracer Architecture</strong></figcaption>
</figure>

MRTracer enables the execution of the Path Tracing algorithm across multiple GPUs. When the user selects the option to visualize frame splitting in the settings, borders will highlight the areas rendered by each device in every frame.

<figure style="text-align: center;">
  <img width="407" alt="image" src="https://github.com/user-attachments/assets/865ee070-be97-437f-bca8-63f159fddfcf" />
  <br/>
  <figcaption><strong>MRTracer Architecture</strong></figcaption>
</figure>

---





const fs = require("fs").promises;

async function convertGltfToGlb(files) {
  const fileblobs = {};
  let gltf;
  let outputBuffers = [];
  let bufferMap = new Map();
  let bufferOffset = 0;
  let glbfilename;

  // Process all input files
  for (const file of files) {
    const fileContent = await fs.readFile(file.path);
    const extension = file.originalname.split(".").pop().toLowerCase();

    if (extension === "gltf") {
      // Handle GLTF file
      gltf = JSON.parse(fileContent.toString());
      glbfilename = file.originalname.substring(
        0,
        file.originalname.lastIndexOf(".")
      );
    } else {
      // Handle other files (textures, etc.)
      fileblobs[file.originalname.toLowerCase()] = fileContent.buffer;
    }
  }

  if (!gltf) {
    throw new Error("No GLTF file found in the input");
  }

  // Process buffers and images
  await processBuffers();

  // Create and return GLB buffer
  return createGlbBuffer();

  // Helper function to process buffers
  async function processBuffers() {
    const pendingBuffers = gltf.buffers.map(async (buffer, bufferIndex) => {
      const data = await dataFromUri(buffer);
      if (data !== undefined) {
        outputBuffers.push(data);
      }
      delete buffer.uri;
      buffer.byteLength = data.byteLength;
      bufferMap.set(bufferIndex, bufferOffset);
      bufferOffset += alignedLength(data.byteLength);
    });

    await Promise.all(pendingBuffers);

    const bufferIndex = gltf.buffers.length;
    const images = gltf.images || [];
    const pendingImages = images.map(async (image) => {
      const data = await dataFromUri(image);
      if (data === undefined) {
        delete image["uri"];
        return;
      }
      const bufferView = {
        buffer: 0,
        byteOffset: bufferOffset,
        byteLength: data.byteLength,
      };
      bufferMap.set(bufferIndex, bufferOffset);
      bufferOffset += alignedLength(data.byteLength);
      const bufferViewIndex = gltf.bufferViews.length;
      gltf.bufferViews.push(bufferView);
      outputBuffers.push(data);
      image["bufferView"] = bufferViewIndex;
      image["mimeType"] = getMimeType(image.uri);
      delete image["uri"];
    });

    await Promise.all(pendingImages);
  }

  // Helper function to create GLB buffer
  function createGlbBuffer() {
    const Binary = {
      Magic: 0x46546c67,
    };

    // Update buffer views
    for (const bufferView of gltf.bufferViews) {
      if (bufferView.byteOffset === undefined) {
        bufferView.byteOffset = 0;
      } else {
        bufferView.byteOffset =
          bufferView.byteOffset + bufferMap.get(bufferView.buffer);
      }
      bufferView.buffer = 0;
    }

    const binBufferSize = bufferOffset;
    gltf.buffers = [
      {
        byteLength: binBufferSize,
      },
    ];

    // Prepare JSON chunk
    const jsonBuffer = Buffer.from(JSON.stringify(gltf));
    const jsonAlignedLength = alignedLength(jsonBuffer.length);
    const padding = jsonAlignedLength - jsonBuffer.length;

    // Calculate total size
    const totalSize =
      12 + // file header: magic + version + length
      8 + // json chunk header: json length + type
      jsonAlignedLength +
      8 + // bin chunk header: chunk length + type
      binBufferSize;

    // Create final buffer
    const finalBuffer = Buffer.alloc(totalSize);
    let bufIndex = 0;

    // Write header
    finalBuffer.writeUInt32LE(Binary.Magic, bufIndex);
    bufIndex += 4;
    finalBuffer.writeUInt32LE(2, bufIndex);
    bufIndex += 4;
    finalBuffer.writeUInt32LE(totalSize, bufIndex);
    bufIndex += 4;

    // Write JSON chunk header
    finalBuffer.writeUInt32LE(jsonAlignedLength, bufIndex);
    bufIndex += 4;
    finalBuffer.writeUInt32LE(0x4e4f534a, bufIndex);
    bufIndex += 4;

    // Write JSON chunk
    jsonBuffer.copy(finalBuffer, bufIndex);
    bufIndex += jsonBuffer.length;

    // Add padding
    if (padding > 0) {
      finalBuffer.fill(0x20, bufIndex, bufIndex + padding);
      bufIndex += padding;
    }

    // Write BIN chunk header
    finalBuffer.writeUInt32LE(binBufferSize, bufIndex);
    bufIndex += 4;
    finalBuffer.writeUInt32LE(0x004e4942, bufIndex);
    bufIndex += 4;

    // Write BIN chunk
    for (let i = 0; i < outputBuffers.length; i++) {
      const bufOffset = bufIndex + bufferMap.get(i);
      const buf = Buffer.from(outputBuffers[i]);
      buf.copy(finalBuffer, bufOffset);
    }

    return {
      buffer: finalBuffer,
      filename: `${glbfilename}.glb`,
    };
  }

  // Helper functions
  function dataFromUri(buffer) {
    if (buffer.uri === undefined) {
      return Promise.resolve(undefined);
    } else if (isBase64(buffer.uri)) {
      return decodeBase64(buffer.uri);
    } else {
      const filename = buffer.uri.substr(buffer.uri.lastIndexOf("/") + 1);
      return Promise.resolve(fileblobs[filename.toLowerCase()]);
    }
  }

  function isBase64(uri) {
    return uri.length < 5 ? false : uri.substr(0, 5) === "data:";
  }

  function decodeBase64(uri) {
    const base64Data = uri.split(",")[1];
    return Promise.resolve(Buffer.from(base64Data, "base64").buffer);
  }

  function alignedLength(value) {
    const alignValue = 4;
    if (value == 0) {
      return value;
    }
    const multiple = value % alignValue;
    if (multiple === 0) {
      return value;
    }
    return value + (alignValue - multiple);
  }

  function getMimeType(filename) {
    const gltfMimeTypes = {
      "image/png": ["png"],
      "image/jpeg": ["jpg", "jpeg"],
      "text/plain": ["glsl", "vert", "vs", "frag", "fs", "txt"],
      "image/vnd-ms.dds": ["dds"],
    };

    for (const mimeType in gltfMimeTypes) {
      for (const extension of gltfMimeTypes[mimeType]) {
        if (filename.toLowerCase().endsWith("." + extension)) {
          return mimeType;
        }
      }
    }
    return "application/octet-stream";
  }
}

module.exports = convertGltfToGlb;

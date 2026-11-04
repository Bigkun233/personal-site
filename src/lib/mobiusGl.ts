// src/lib/mobiusGl.ts —— 首页装饰用的莫比乌斯环 WebGL 渲染器
// 与 public/mobius.html 里的完整演示同源，这里只保留「当背景」所需的最小能力：
// 没有 UI、没有交互控件，只接受外部传入的指针偏移来做轻微视差。

export interface MobiusOptions {
  /** 半扭转数：奇数=单侧曲面，偶数=双侧。视觉上用 1 最像教科书里的莫比乌斯环 */
  twist?: number
  /** 半带宽 */
  width?: number
  /** 模型在视图里的水平偏移，用来把环推向一侧给文字让位 */
  offsetX?: number
  /** 垂直偏移，正数向下 */
  offsetY?: number
  /** 环在画面里的目标高度占比（0–1） */
  heightRatio?: number
  /** 自转速度（弧度/秒） */
  speed?: number
}

export interface MobiusHandle {
  /** 尺寸变化后调用 */
  resize(): void
  /** 指针归一化坐标，范围 [-1, 1] */
  setPointer(x: number, y: number): void
  /** 每帧调用，t 为秒 */
  render(t: number): void
  dispose(): void
}

const TAU = Math.PI * 2

function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3]
    }
  }
  return out
}

function perspective(fovy: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

function translation(x: number, y: number, z: number): Float32Array {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
}

function rotationX(a: number): Float32Array {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
}

function rotationY(a: number): Float32Array {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
}

const VERT = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aUV;

  uniform mat4 uMVP;
  uniform mat4 uModel;

  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUV;

  void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    vWorld = world.xyz;
    vNormal = mat3(uModel) * aNormal;
    vUV = aUV;
    gl_Position = uMVP * vec4(aPosition, 1.0);
  }
`

function fragment(withGrid: boolean): string {
  return `
  ${withGrid ? '#extension GL_OES_standard_derivatives : enable' : ''}
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec2 vUV;

  uniform vec3 uEye;
  uniform float uGrid;

  ${
    withGrid
      ? `
  vec2 gridLine(vec2 uv, vec2 count) {
    vec2 coord = uv * count;
    vec2 w = max(fwidth(coord), vec2(0.0001));
    vec2 g = abs(fract(coord - 0.5) - 0.5) / w;
    return 1.0 - min(g, vec2(1.0));
  }
  `
      : ''
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uEye - vWorld);

    // 莫比乌斯环不可定向：法线翻到朝向观察者的一侧，光照才是连续的
    vec3 Nf = dot(N, V) < 0.0 ? -N : N;

    float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 3.0);

    float sweep = 0.5 + 0.5 * sin(vUV.x * 6.2831853 + 0.55 + 0.28 * sin(vUV.y * 3.1415926));
    vec3 base = mix(vec3(0.010, 0.052, 0.055), vec3(0.016, 0.195, 0.178),
                    smoothstep(0.0, 0.62, sweep));
    base = mix(base, vec3(0.30, 0.235, 0.105), smoothstep(0.38, 0.84, sweep) * 0.58);
    base = mix(base, vec3(0.72, 0.365, 0.095), smoothstep(0.62, 1.0, sweep) * 0.82);
    base = mix(base, vec3(0.045, 0.42, 0.38), fres * 0.38);

    vec3 L1 = normalize(vec3(-0.60, 1.00, 0.72));
    vec3 L2 = normalize(vec3(0.86, -0.28, 0.52));
    float key = max(dot(Nf, L1), 0.0);
    float fill = max(dot(Nf, L2), 0.0);

    float spec = pow(max(dot(Nf, normalize(L1 + V)), 0.0), 140.0);
    float spec2 = pow(max(dot(Nf, normalize(L2 + V)), 0.0), 20.0);

    vec3 col = base * (0.115 + 1.18 * key + 0.30 * fill);
    col += vec3(1.0, 0.80, 0.52) * spec * 0.82;
    col += vec3(0.24, 0.92, 0.82) * spec2 * 0.09;

    float edge = smoothstep(0.89, 0.997, vUV.y);
    col = mix(col, vec3(0.88, 0.60, 0.27), edge * 0.36);
    col += vec3(0.95, 0.57, 0.24) * pow(edge, 6.0) * 0.24;

    ${
      withGrid
        ? `
    vec2 line = gridLine(vUV, vec2(48.0, 4.0));
    col = mix(col, vec3(0.72, 0.90, 0.82), (line.x * 0.072 + line.y * 0.022) * uGrid);
    `
        : ''
    }

    col = vec3(1.0) - exp(-col * 1.55);
    col = pow(col, vec3(0.90));

    gl_FragColor = vec4(col, 1.0);
  }
  `
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGLRenderingContext, vertex: string, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex)
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

interface Geometry {
  positions: Float32Array
  normals: Float32Array
  uvs: Float32Array
  indices: Uint16Array
}

function buildGeometry(twist: number, halfWidth: number): Geometry {
  const uSeg = 260
  const vSeg = 12
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const radius = 1.6

  for (let i = 0; i <= uSeg; i++) {
    const u = (i / uSeg) * TAU
    const a = (twist * u) / 2
    const ca = Math.cos(a)
    const sa = Math.sin(a)

    for (let j = 0; j <= vSeg; j++) {
      const t = (j / vSeg) * 2 - 1
      const v = t * halfWidth
      const r = radius + v * ca

      // 位置
      positions.push(r * Math.cos(u), v * sa, r * Math.sin(u))

      // 解析法线：∂P/∂u × ∂P/∂v
      const ru = -v * (twist / 2) * sa
      const pu = [
        ru * Math.cos(u) - r * Math.sin(u),
        v * (twist / 2) * ca,
        ru * Math.sin(u) + r * Math.cos(u),
      ]
      const pv = [ca * Math.cos(u), sa, ca * Math.sin(u)]
      const nx = pu[1] * pv[2] - pu[2] * pv[1]
      const ny = pu[2] * pv[0] - pu[0] * pv[2]
      const nz = pu[0] * pv[1] - pu[1] * pv[0]
      const len = Math.hypot(nx, ny, nz) || 1
      normals.push(nx / len, ny / len, nz / len)

      // |t| 让接缝处 v → -v 时纹理连续
      uvs.push(i / uSeg, Math.abs(t))
    }
  }

  const row = vSeg + 1
  for (let i = 0; i < uSeg; i++) {
    for (let j = 0; j < vSeg; j++) {
      const a = i * row + j
      const b = a + row
      const c = a + 1
      const d = b + 1
      indices.push(a, c, b, c, d, b)
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  }
}

export function createMobius(
  canvas: HTMLCanvasElement,
  options: MobiusOptions = {},
): MobiusHandle | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  })
  if (!gl) return null

  const withGrid = !!gl.getExtension('OES_standard_derivatives')
  const program = link(gl, VERT, fragment(withGrid))
  if (!program) return null

  const twist = options.twist ?? 1
  const geometry = buildGeometry(twist, options.width ?? 0.5)
  const offsetX = options.offsetX ?? 0.42
  const offsetY = options.offsetY ?? 0
  const heightRatio = options.heightRatio ?? 0.72
  const speed = options.speed ?? 0.16

  const loc = {
    aPosition: gl.getAttribLocation(program, 'aPosition'),
    aNormal: gl.getAttribLocation(program, 'aNormal'),
    aUV: gl.getAttribLocation(program, 'aUV'),
    uMVP: gl.getUniformLocation(program, 'uMVP'),
    uModel: gl.getUniformLocation(program, 'uModel'),
    uEye: gl.getUniformLocation(program, 'uEye'),
    uGrid: gl.getUniformLocation(program, 'uGrid'),
  }

  const positionBuffer = gl.createBuffer()!
  const normalBuffer = gl.createBuffer()!
  const uvBuffer = gl.createBuffer()!
  const indexBuffer = gl.createBuffer()!

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

  let pointerX = 0
  let pointerY = 0
  let smoothX = 0
  let smoothY = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (w === canvas.width && h === canvas.height) return
    canvas.width = w
    canvas.height = h
    gl!.viewport(0, 0, w, h)
  }

  function render(time: number) {
    const t = time * 0.001
    smoothX += (pointerX - smoothX) * 0.06
    smoothY += (pointerY - smoothY) * 0.06

    const aspect = Math.max(0.4, canvas.width / Math.max(1, canvas.height))
    const fov = (38 * Math.PI) / 180
    // 让环的竖直跨度约占画面 heightRatio；同时保证宽屏时不会横向溢出
    const halfHeight = 2.35 / heightRatio
    const distByHeight = halfHeight / Math.tan(fov / 2)
    const distByWidth = Math.max(halfHeight, 2.6 / aspect) / Math.tan(fov / 2)
    const dist = Math.max(distByHeight, distByWidth)

    const yaw = t * speed + smoothX * 0.42
    const pitch = 0.56 + smoothY * 0.26

    const model = multiply(
      translation(offsetX, offsetY, 0),
      multiply(rotationX(pitch), rotationY(yaw)),
    )
    const view = translation(0, 0, -dist)
    const projection = perspective(fov, aspect, 0.1, 100)
    const mvp = multiply(projection, multiply(view, model))

    gl!.clearColor(0, 0, 0, 0)
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT)

    gl!.enable(gl!.DEPTH_TEST)
    gl!.depthFunc(gl!.LEQUAL)
    gl!.disable(gl!.CULL_FACE)
    gl!.disable(gl!.BLEND)

    gl!.useProgram(program)
    gl!.uniformMatrix4fv(loc.uMVP, false, mvp)
    gl!.uniformMatrix4fv(loc.uModel, false, model)
    gl!.uniform3f(loc.uEye, 0, 0, dist)
    gl!.uniform1f(loc.uGrid, 1)

    gl!.bindBuffer(gl!.ARRAY_BUFFER, positionBuffer)
    gl!.enableVertexAttribArray(loc.aPosition)
    gl!.vertexAttribPointer(loc.aPosition, 3, gl!.FLOAT, false, 0, 0)

    gl!.bindBuffer(gl!.ARRAY_BUFFER, normalBuffer)
    gl!.enableVertexAttribArray(loc.aNormal)
    gl!.vertexAttribPointer(loc.aNormal, 3, gl!.FLOAT, false, 0, 0)

    gl!.bindBuffer(gl!.ARRAY_BUFFER, uvBuffer)
    gl!.enableVertexAttribArray(loc.aUV)
    gl!.vertexAttribPointer(loc.aUV, 2, gl!.FLOAT, false, 0, 0)

    gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl!.drawElements(gl!.TRIANGLES, geometry.indices.length, gl!.UNSIGNED_SHORT, 0)
  }

  resize()

  return {
    resize,
    setPointer(x: number, y: number) {
      pointerX = Math.max(-1, Math.min(1, x))
      pointerY = Math.max(-1, Math.min(1, y))
    },
    render,
    dispose() {
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(normalBuffer)
      gl.deleteBuffer(uvBuffer)
      gl.deleteBuffer(indexBuffer)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}

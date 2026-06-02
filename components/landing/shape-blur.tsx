"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Adapted from React Bits' ShapeBlur (three.js) to typed TSX. The stock shader
// draws a square-ish rounded shape that can't sit on a non-square element's
// edges, so the border is rewritten as an *aspect-correct* rounded box whose
// outline lands exactly on the host rectangle's edges (matching its corner
// radius) and is revealed softly only near the cursor — i.e. the host element
// itself appears to glow on hover. Perf guards vs. the source: rAF runs only
// while on-screen (IntersectionObserver), skips when the tab is hidden, DPR is
// capped at 1.5, single pointermove listener, and WebGL creation is guarded.

type ShapeBlurProps = {
  className?: string;
  variation?: number;
  pixelRatioProp?: number;
  shapeSize?: number;
  roundness?: number;
  borderSize?: number;
  circleSize?: number;
  circleEdge?: number;
  color?: string;
  opacity?: number;
};

const vertexShader = /* glsl */ `
varying vec2 v_texcoord;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_texcoord = uv;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform float u_shapeSize;   // 1.0 = frame sits on the very edge
uniform float u_roundness;   // corner radius, in units of element height
uniform float u_borderSize;  // half border thickness, in units of element height
uniform float u_circleSize;  // cursor reveal radius
uniform float u_circleEdge;  // cursor reveal softness
uniform vec3  u_color;       // frame tint
uniform float u_opacity;     // overall frame opacity

float sdRoundBox(in vec2 p, in vec2 b, in float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
    vec2 res = u_resolution;
    float ar = res.x / res.y;

    // aspect-corrected space: 1 unit = element height in px, origin at centre
    vec2 p  = (v_texcoord - 0.5) * vec2(ar, 1.0);
    vec2 muv = (u_mouse * u_pixelRatio) / res;
    muv.y = 1.0 - muv.y;              // mouse Y is top-down; uv Y is bottom-up
    vec2 mo = (muv - 0.5) * vec2(ar, 1.0);

    vec2 halfExt = vec2(ar, 1.0) * 0.5;            // half-extents to the edges
    vec2 b = halfExt * u_shapeSize - u_borderSize; // outline lands on the edge
    float d = sdRoundBox(p, b, u_roundness);

    float aa = fwidth(d) + 0.0008;
    float border = 1.0 - smoothstep(u_borderSize, u_borderSize + aa, abs(d));

    float reveal = 1.0 - smoothstep(u_circleSize, u_circleSize + u_circleEdge, length(p - mo));

    gl_FragColor = vec4(u_color, border * reveal * u_opacity);
}
`;

export default function ShapeBlur({
  className = "",
  variation = 0,
  pixelRatioProp = 2,
  shapeSize = 1.0,
  roundness = 0.05,
  borderSize = 0.012,
  circleSize = 0.4,
  circleEdge = 0.4,
  color = "#ffffff",
  opacity = 1,
}: ShapeBlurProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let active = true;
    let running = false;
    let rafId = 0;
    let time = 0;
    let lastTime = 0;

    const vMouse = new THREE.Vector2();
    const vMouseDamp = new THREE.Vector2();
    const vResolution = new THREE.Vector2();

    let w = 1;
    let h = 1;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera();
    camera.position.z = 1;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      // No WebGL on this device — render nothing rather than crash the section.
      return;
    }
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const geo = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_mouse: { value: vMouseDamp },
        u_resolution: { value: vResolution },
        u_pixelRatio: { value: pixelRatioProp },
        u_shapeSize: { value: shapeSize },
        u_roundness: { value: roundness },
        u_borderSize: { value: borderSize },
        u_circleSize: { value: circleSize },
        u_circleEdge: { value: circleEdge },
        u_color: { value: new THREE.Color(color) },
        u_opacity: { value: opacity },
      },
      defines: { VAR: variation },
      transparent: true,
    });

    const quad = new THREE.Mesh(geo, material);
    scene.add(quad);

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
    };
    document.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      if (!active) return;
      w = mount.clientWidth;
      h = mount.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);

      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();

      quad.scale.set(w, h, 1);
      vResolution.set(w, h).multiplyScalar(dpr);
      material.uniforms.u_pixelRatio.value = dpr;
    };

    resize();
    window.addEventListener("resize", resize);

    const ro = new ResizeObserver(() => resize());
    ro.observe(mount);

    const loop = () => {
      if (!active || !running) return;
      rafId = requestAnimationFrame(loop);
      if (document.hidden) return;

      time = performance.now() * 0.001;
      const dt = time - lastTime;
      lastTime = time;

      (["x", "y"] as const).forEach((k) => {
        vMouseDamp[k] = THREE.MathUtils.damp(vMouseDamp[k], vMouse[k], 8, dt);
      });

      renderer.render(scene, camera);
    };

    const start = () => {
      if (running || !active) return;
      running = true;
      lastTime = performance.now() * 0.001;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Only burn frames while the host element is actually on-screen.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(mount);

    return () => {
      active = false;
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onPointerMove);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geo.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [
    variation,
    pixelRatioProp,
    shapeSize,
    roundness,
    borderSize,
    circleSize,
    circleEdge,
    color,
    opacity,
  ]);

  return (
    <div
      className={className}
      ref={mountRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

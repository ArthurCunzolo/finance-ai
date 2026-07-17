"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * FlowConstellation — elemento de assinatura visual do Finance AI.
 *
 * Em vez de dinheiro/moedas literais flutuando (clichê de fintech), a cena
 * representa o próprio mecanismo do produto: nós de renda à esquerda emitem
 * pulsos de luz que viajam por curvas até um núcleo de alocação central, e
 * de lá se distribuem para nós de destino (essenciais + reserva) à direita.
 * É a metáfora exata do motor de distribuição descrito no PRD, renderizada.
 */
export function FlowConstellation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isMobile = window.innerWidth < 768;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mintColor = new THREE.Color(0x2fbf83);
    const mintSoft = new THREE.Color(0x8cf2c0);
    const goldColor = new THREE.Color(0xc9a227);
    const steelColor = new THREE.Color(0x6e8ca0);

    // --- Nós --------------------------------------------------------------
    interface Node {
      mesh: THREE.Mesh;
      basePosition: THREE.Vector3;
      pulsePhase: number;
    }

    const nodeGeo = new THREE.IcosahedronGeometry(0.11, 1);
    const sourceMat = new THREE.MeshStandardMaterial({
      color: steelColor,
      emissive: steelColor,
      emissiveIntensity: 0.4,
      roughness: 0.35,
      metalness: 0.6,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: mintColor,
      emissive: mintColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
    });
    const targetMat = new THREE.MeshStandardMaterial({
      color: mintSoft,
      emissive: mintSoft,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.6,
    });
    const reserveMat = new THREE.MeshStandardMaterial({
      color: goldColor,
      emissive: goldColor,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.7,
    });

    const sourceCount: number = isMobile ? 3 : 4;
    const targetCount: number = isMobile ? 3 : 4;

    const sources: Node[] = Array.from({ length: sourceCount }, (_, i) => {
      const t = sourceCount === 1 ? 0.5 : i / (sourceCount - 1);
      const pos = new THREE.Vector3(-4.4, (t - 0.5) * 3.4, -0.6 + Math.sin(i) * 0.4);
      const mesh = new THREE.Mesh(nodeGeo, sourceMat);
      mesh.position.copy(pos);
      scene.add(mesh);
      return { mesh, basePosition: pos.clone(), pulsePhase: i * 0.8 };
    });

    const corePos = new THREE.Vector3(0, 0, 0);
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 2), coreMat);
    coreMesh.position.copy(corePos);
    scene.add(coreMesh);

    const targets: Node[] = Array.from({ length: targetCount }, (_, i) => {
      const t = targetCount === 1 ? 0.5 : i / (targetCount - 1);
      const isReserve = i === targetCount - 1;
      const pos = new THREE.Vector3(4.4, (t - 0.5) * 3.4, -0.6 + Math.cos(i) * 0.4);
      const mesh = new THREE.Mesh(nodeGeo, isReserve ? reserveMat : targetMat);
      mesh.position.copy(pos);
      scene.add(mesh);
      return { mesh, basePosition: pos.clone(), pulsePhase: i * 0.6 };
    });

    // --- Curvas de conexão --------------------------------------------------
    function buildCurve(from: THREE.Vector3, to: THREE.Vector3): THREE.CatmullRomCurve3 {
      const mid = from.clone().lerp(to, 0.5);
      mid.y += (to.y - from.y) * 0.15;
      mid.z += 0.9;
      return new THREE.CatmullRomCurve3([from, mid, to]);
    }

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3a4048,
      transparent: true,
      opacity: 0.35,
    });

    const inCurves = sources.map((s) => buildCurve(s.basePosition, corePos));
    const outCurves = targets.map((t) => buildCurve(corePos, t.basePosition));

    [...inCurves, ...outCurves].forEach((curve) => {
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      scene.add(new THREE.Line(geo, lineMat));
    });

    // --- Partículas de fluxo (pulsos viajando pelas curvas) -----------------
    const particlesPerCurve = isMobile ? 1 : 2;
    interface FlowParticle {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      progress: number;
      speed: number;
    }

    const particleGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const particleMatIn = new THREE.MeshBasicMaterial({ color: steelColor });
    const particleMatOut = new THREE.MeshBasicMaterial({ color: mintSoft });

    const flowParticles: FlowParticle[] = [];
    inCurves.forEach((curve) => {
      for (let i = 0; i < particlesPerCurve; i++) {
        const mesh = new THREE.Mesh(particleGeo, particleMatIn);
        scene.add(mesh);
        flowParticles.push({
          curve,
          mesh,
          progress: i / particlesPerCurve,
          speed: 0.15 + Math.random() * 0.08,
        });
      }
    });
    outCurves.forEach((curve) => {
      for (let i = 0; i < particlesPerCurve; i++) {
        const mesh = new THREE.Mesh(particleGeo, particleMatOut);
        scene.add(mesh);
        flowParticles.push({
          curve,
          mesh,
          progress: i / particlesPerCurve,
          speed: 0.15 + Math.random() * 0.08,
        });
      }
    });

    // --- Campo de estrelas discreto ao fundo ---------------------------------
    const starCount = isMobile ? 200 : 500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.014,
      color: 0x5b6167,
      transparent: true,
      opacity: 0.5,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Luzes ---------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.PointLight(0x2fbf83, 6, 12);
    key.position.set(0, 1.5, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0x6e8ca0, 3, 14);
    rim.position.set(-3, -1, -3);
    scene.add(rim);

    // --- Interação de mouse (parallax leve da câmera) -------------------------
    const mouse = new THREE.Vector2(0, 0);
    function onMouseMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        [...sources, ...targets].forEach((node) => {
          node.mesh.position.y =
            node.basePosition.y + Math.sin(elapsed * 0.6 + node.pulsePhase) * 0.08;
          node.mesh.rotation.y += delta * 0.3;
        });
        coreMesh.rotation.y += delta * 0.25;
        coreMesh.rotation.x += delta * 0.12;
        const corePulse = 1 + Math.sin(elapsed * 1.4) * 0.06;
        coreMesh.scale.setScalar(corePulse);

        flowParticles.forEach((p) => {
          p.progress += delta * p.speed;
          if (p.progress > 1) p.progress -= 1;
          const point = p.curve.getPointAt(p.progress);
          p.mesh.position.copy(point);
        });

        camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.03;
        camera.position.y += (0.4 + mouse.y * 0.3 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      role="img"
      aria-label="Visualização animada do fluxo de dinheiro entre fontes de renda, alocação de prioridades e reserva de emergência"
    />
  );
}

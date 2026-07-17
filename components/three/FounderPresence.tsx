"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * FounderPresence — placeholder deliberado.
 *
 * O PRD pede um avatar 3D hiper-realista do fundador (modelo humano, piscar,
 * respiração, head-tracking). Isso exige um asset .glb modelado/escaneado
 * externamente — não é algo que se gera proceduralmente com boa qualidade.
 * Este componente entrega a MECÂNICA completa (idle loop, respiração, olhar
 * seguindo o cursor, piscar) sobre uma forma abstrata de "presença" (núcleo
 * orgânico com anel de "íris"), pronta para ser trocada por `useGLTF('/founder.glb')`
 * assim que o modelo real for produzido — sem alterar a lógica de animação.
 */
export function FounderPresence() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 0, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mint = new THREE.Color(0x2fbf83);

    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    const coreGeo = new THREE.SphereGeometry(1, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x14171b,
      roughness: 0.25,
      metalness: 0.4,
      emissive: mint,
      emissiveIntensity: 0.05,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    bodyGroup.add(core);

    // "Íris" — ponto de luz que representa o olhar, segue o cursor
    const irisGroup = new THREE.Group();
    irisGroup.position.set(0, 0.05, 0.92);
    bodyGroup.add(irisGroup);

    const irisGeo = new THREE.CircleGeometry(0.16, 32);
    const irisMat = new THREE.MeshBasicMaterial({ color: mint });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    irisGroup.add(iris);

    const eyelidGeo = new THREE.CircleGeometry(0.17, 32);
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x14171b });
    const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
    eyelid.position.z = 0.001;
    eyelid.scale.y = 0;
    irisGroup.add(eyelid);

    // Anel orbital sutil — sugere um campo de "consciência", não um efeito genérico
    const ringGeo = new THREE.TorusGeometry(1.55, 0.006, 8, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: mint,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2, 2, 3);
    scene.add(key);
    const glow = new THREE.PointLight(0x2fbf83, 4, 8);
    glow.position.set(0, -0.5, 2);
    scene.add(glow);

    const mouse = new THREE.Vector2(0, 0);
    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
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

    let nextBlinkAt = 2 + Math.random() * 3;
    let blinkProgress = -1; // -1 = não piscando

    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Respiração: leve escala senoidal
        const breath = 1 + Math.sin(elapsed * 0.8) * 0.015;
        bodyGroup.scale.setScalar(breath);

        // Head-tracking parcial: olha na direção do cursor, com limite de ângulo
        const targetX = THREE.MathUtils.clamp(mouse.x * 0.35, -0.35, 0.35);
        const targetY = THREE.MathUtils.clamp(mouse.y * 0.25, -0.25, 0.25);
        bodyGroup.rotation.y += (targetX - bodyGroup.rotation.y) * 0.04;
        bodyGroup.rotation.x += (-targetY - bodyGroup.rotation.x) * 0.04;

        // Piscar periódico
        if (blinkProgress < 0 && elapsed > nextBlinkAt) {
          blinkProgress = 0;
        }
        if (blinkProgress >= 0) {
          blinkProgress += delta * 6;
          const t = Math.min(blinkProgress, Math.PI);
          eyelid.scale.y = Math.sin(t);
          if (blinkProgress > Math.PI) {
            blinkProgress = -1;
            nextBlinkAt = elapsed + 2 + Math.random() * 3;
          }
        }

        ring.rotation.z += delta * 0.1;
        glow.intensity = 3.5 + Math.sin(elapsed * 1.6) * 0.6;

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
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
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
      aria-label="Representação abstrata animada que reage ao movimento do cursor"
    />
  );
}

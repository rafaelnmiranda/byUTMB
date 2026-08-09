"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";

const MAP_SRC = "/images/maps/mapa-evento-2026.svg";

export function EventMapViewer() {
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  function toggleFullscreen() {
    setIsFullscreen((current) => !current);
    window.setTimeout(() => transformRef.current?.centerView(1, 0), 80);
  }

  const viewer = (
    <div
      className={`relative overflow-hidden bg-[#e7edf4] ${
        isFullscreen
          ? "fixed inset-0 z-[100] h-dvh w-screen"
          : "aspect-[8/5] w-full rounded-xl"
      }`}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={1}
        maxScale={5}
        centerOnInit
        limitToBounds
        wheel={{ step: 0.18 }}
        pinch={{ step: 5 }}
        doubleClick={{ step: 0.7 }}
        panning={{ velocityDisabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <Image
            src={MAP_SRC}
            alt="Mapa ilustrado da Arena e da Expo do Paraty Brazil by UTMB 2026, conectadas pela Ponte do Pontal"
            width={1600}
            height={1000}
            priority
            unoptimized
            draggable={false}
            className="h-full w-full select-none object-contain"
          />
        </TransformComponent>
      </TransformWrapper>

      <MapControls
        isFullscreen={isFullscreen}
        onZoomIn={() => transformRef.current?.zoomIn(0.5)}
        onZoomOut={() => transformRef.current?.zoomOut(0.5)}
        onReset={() => transformRef.current?.resetTransform()}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );

  return isFullscreen ? createPortal(viewer, document.body) : viewer;
}

function MapControls({
  isFullscreen,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
}: {
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div
      className="absolute right-2 top-2 z-10 flex gap-1 rounded-lg bg-white/95 p-1 text-utmb-navy shadow-md ring-1 ring-black/10 backdrop-blur"
      role="group"
      aria-label="Controles do mapa"
    >
      <ControlButton label="Ampliar mapa" onClick={onZoomIn}>
        <path d="M12 5v14M5 12h14" />
      </ControlButton>
      <ControlButton label="Reduzir mapa" onClick={onZoomOut}>
        <path d="M5 12h14" />
      </ControlButton>
      <ControlButton label="Redefinir zoom" onClick={onReset}>
        <path d="M4 9a8 8 0 1 1 1 7M4 9V4m0 5h5" />
      </ControlButton>
      <span className="mx-0.5 w-px bg-slate-200" aria-hidden />
      <ControlButton
        label={isFullscreen ? "Sair da tela cheia" : "Abrir mapa em tela cheia"}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
        )}
      </ControlButton>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md transition hover:bg-slate-100 active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

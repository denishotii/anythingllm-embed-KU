import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";

/**
 * ShadowRootPortal wraps its children in a shadow DOM and injects the built CSS file.
 * Usage: <ShadowRootPortal cssHref="/path/to/index.css">...</ShadowRootPortal>
 */
export default function ShadowRootPortal({ children, cssHref = "/src/index.css" }) {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    if (hostRef.current && !shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: "open" });
      setShadowRoot(shadow);
    }
  }, [hostRef, shadowRoot]);

  useEffect(() => {
    if (shadowRoot && !mountNode) {
      // Inject CSS link
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      shadowRoot.appendChild(link);
      // Create a mount node for React
      const mount = document.createElement("div");
      shadowRoot.appendChild(mount);
      setMountNode(mount);
    }
  }, [shadowRoot, mountNode, cssHref]);

  return (
    <div ref={hostRef}>
      {mountNode && ReactDOM.createPortal(children, mountNode)}
    </div>
  );
} 
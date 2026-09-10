'use client';

import { Component, type ReactNode } from 'react';
import PhoneSceneFallback from './PhoneSceneFallback';

/**
 * The 3D hero must never be able to take the page down with it.
 *
 * Three.js throws synchronously when it cannot get a WebGL context — a device
 * with no GPU, WebGL disabled by policy, a driver the browser blocklists, or
 * simply too many live contexts on the tab. React has no default handling for
 * a throw during render, so without this boundary the whole route unmounts and
 * the visitor gets "Application error: a client-side exception has occurred"
 * on a black screen.
 *
 * That is bad anywhere. On a paid landing page it is a click we bought,
 * charged for, and threw away — and the visitor never saw a price, a headline
 * or a button. The static phone is a worse hero than the real one and an
 * enormously better one than nothing.
 */
interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export default class PhoneSceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Worth knowing about, never worth crashing over.
    console.warn('[phone-scene] falling back to the static phone:', error);
  }

  render() {
    if (this.state.failed) return <PhoneSceneFallback />;
    return this.props.children;
  }
}

/**
 * Can this browser actually render the scene? Checked before mounting rather
 * than after throwing, so the common case never constructs a renderer it
 * cannot use. A probe context is created and immediately released.
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Release the probe context immediately; browsers cap how many exist.
    (gl as WebGLRenderingContext)
      .getExtension('WEBGL_lose_context')
      ?.loseContext();
    return true;
  } catch {
    return false;
  }
}

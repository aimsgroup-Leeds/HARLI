/* Local, on-demand anatomy exploration for the HARLI project page. */
(() => {
  'use strict';

  const scriptURL = document.currentScript && document.currentScript.src;
  const baseURL = new URL('.', scriptURL || new URL('assets/anatomy/viewer.js', document.baseURI));
  const root = document.getElementById('anatomy-viewer');
  if (!root) return;
  // Keep touch activation discoverable on hybrid devices with a mouse as the
  // primary pointer; changing viewport size must not hide the exit control.
  root.classList.toggle('anatomy-has-touch', navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer:coarse)').matches);

  const byID = suffix => document.getElementById('anatomy-' + suffix);
  const stage = byID('stage');
  const fallback = byID('fallback');
  const loading = byID('loading');
  const status = byID('status');
  const retry = byID('retry');
  const settings = byID('settings');
  const footer = byID('stage-footer');
  const touchButton = byID('touch');
  const transparency = byID('transparency');
  const transparencyValue = byID('transparency-value');
  const wireframe = byID('wireframe');
  const viewLabel = byID('current-view');
  const presetButtons = [...root.querySelectorAll('[data-anatomy-view]')];
  const layerInputs = [...root.querySelectorAll('[data-anatomy-layer]')];
  const scriptLoads = window.__harliViewerLibraryLoads || (window.__harliViewerLibraryLoads = new Map());
  let canvas = byID('canvas');
  let runtime = null;
  let pending = false;
  let inView = false;

  function loadScript(name) {
    const url = new URL(name, baseURL).href;
    if (scriptLoads.has(url)) return scriptLoads.get(url);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement('script');
      const timer = window.setTimeout(() => fail(), 20000);
      function fail() {
        window.clearTimeout(timer);
        element.remove();
        scriptLoads.delete(url);
        reject(new Error('A local viewer library could not be loaded.'));
      }
      element.src = url;
      element.onload = () => { window.clearTimeout(timer); resolve(); };
      element.onerror = fail;
      document.head.appendChild(element);
    });
    scriptLoads.set(url, promise);
    return promise;
  }

  async function loadLibraries() {
    if (!window.THREE) await loadScript('vendor/three.min.js');
    if (!window.THREE || !window.THREE.WebGLRenderer) throw new Error('The 3D library is unavailable.');
    if (!window.THREE.OrbitControls) await loadScript('vendor/OrbitControls.js');
  }

  async function loadGeometry() {
    const abort = new AbortController();
    const timer = window.setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch(new URL('patient04-meshes.json', baseURL), { signal: abort.signal });
      if (!response.ok) throw new Error('The prepared model could not be loaded.');
      const data = await response.json();
      for (const key of ['liver', 'tumour', 'tumor2', 'vena_cava']) {
        const mesh = data.meshes && data.meshes[key];
        if (!mesh || !Array.isArray(mesh.v) || !mesh.v.length || mesh.v.length % 3 ||
            !Array.isArray(mesh.f) || mesh.f.length % 3 ||
            !mesh.v.every(Number.isFinite) ||
            !mesh.f.every(value => Number.isInteger(value) && value >= 0 && value < mesh.v.length / 3) ||
            !Array.isArray(mesh.color) || mesh.color.length !== 3) {
          throw new Error('The prepared model data is incomplete.');
        }
      }
      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function showFallback(message) {
    if (runtime) { runtime.dispose(); runtime = null; }
    root.dataset.state = 'error';
    stage.setAttribute('aria-busy', 'false');
    settings.disabled = true;
    canvas.hidden = true;
    fallback.hidden = false;
    footer.hidden = true;
    loading.hidden = false;
    status.textContent = message;
    retry.textContent = 'Try loading 3D again';
    retry.hidden = false;
    viewLabel.textContent = 'Static preview';
  }

  async function initialise() {
    if (pending || runtime) return;
    pending = true;
    root.dataset.state = 'loading';
    stage.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading interactive anatomy…';
    retry.hidden = true;
    // A fresh canvas also makes retry possible after a lost graphics context.
    const freshCanvas = canvas.cloneNode(false);
    canvas.replaceWith(freshCanvas);
    canvas = freshCanvas;
    try {
      const [, data] = await Promise.all([loadLibraries(), loadGeometry()]);
      runtime = createViewer(data);
      root.dataset.state = 'ready';
      stage.setAttribute('aria-busy', 'false');
      settings.disabled = false;
      canvas.hidden = false;
      fallback.hidden = true;
      loading.hidden = true;
      footer.hidden = false;
      runtime.resize();
    } catch (error) {
      const unsupported = error && /WebGL|context|graphics/i.test(error.message);
      showFallback(unsupported
        ? 'Interactive 3D is unavailable in this browser. You can still explore the prepared model in this static preview.'
        : 'The interactive model could not load. The static preview remains available.');
    } finally {
      pending = false;
    }
  }

  function createViewer(data) {
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch (_) {
      throw new Error('WebGL graphics are unavailable.');
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x09151a, 1);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.01, 100);
    scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x202838, 0.9));
    scene.add(new THREE.AmbientLight(0x223044, 0.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(-1.5, 2, 2.5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x88bbff, 0.6);
    rimLight.position.set(2, -1, -2);
    scene.add(rimLight);

    const group = new THREE.Group();
    const parts = {};
    for (const name of ['tumour', 'tumor2', 'vena_cava', 'liver']) {
      const source = data.meshes[name];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(source.v, 3));
      geometry.setIndex(source.f);
      geometry.computeVertexNormals();
      const color = new THREE.Color(...source.color.map(value => value / 255));
      const isLiver = name === 'liver';
      const material = new THREE.MeshStandardMaterial({
        color, roughness: isLiver ? 0.5 : 0.45, metalness: isLiver ? 0 : 0.08,
        side: THREE.DoubleSide, emissive: color, emissiveIntensity: isLiver ? 0 : 0.16,
        transparent: isLiver, opacity: isLiver ? 0.35 : 1, depthWrite: !isLiver
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = isLiver ? 2 : 1;
      parts[name] = mesh;
      group.add(mesh);
    }
    // Preserve the orientation of the source's prepared frame-204 display.
    // Only the rotation is used: this viewer performs no registration or mesh generation.
    const sourceDisplay = new THREE.Matrix4().fromArray([
      0.5665, -0.36789, -1.124178, 0, -1.18158, -0.118412, -0.556676, 0,
      0.054654, 1.253267, -0.382593, 0, -0.055313, 0.023125, -3, 1
    ]);
    group.quaternion.setFromRotationMatrix(new THREE.Matrix4().extractRotation(sourceDisplay));
    scene.add(group);
    group.updateMatrixWorld(true);
    // Bound the transformed vertices rather than rotated bounding boxes; the
    // latter leave excessive empty space around this asymmetric anatomy.
    const bounds = new THREE.Box3();
    const vertex = new THREE.Vector3();
    function updateBounds() {
      bounds.makeEmpty();
      for (const part of Object.values(parts)) {
        const positions = part.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          bounds.expandByPoint(vertex.fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld));
        }
      }
    }
    updateBounds();
    group.position.sub(bounds.getCenter(new THREE.Vector3()));
    group.updateMatrixWorld(true);
    updateBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
    camera.near = radius / 100;
    camera.far = radius * 100;

    const listeners = [];
    function listen(element, name, handler, options) {
      element.addEventListener(name, handler, options);
      listeners.push(() => element.removeEventListener(name, handler, options));
    }
    let touchActive = false;
    // Keep page scrolling native. Zoom remains available through buttons, keys and pinch.
    listen(canvas, 'wheel', event => event.stopImmediatePropagation(), { capture: true, passive: true });
    listen(canvas, 'touchstart', event => {
      if (!touchActive) event.stopImmediatePropagation();
    }, { capture: true, passive: true });
    listen(canvas, 'touchmove', event => {
      if (!touchActive) event.stopImmediatePropagation();
    }, { capture: true, passive: true });

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.autoRotate = false;
    controls.enablePan = false;
    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 10;
    controls.rotateSpeed = 0.65;
    controls.target.set(0, 0, 0);
    let currentPreset = 'front';
    let frame = 0;
    let disposed = false;
    let width = 0;
    let height = 0;

    function render() {
      if (disposed || frame || !inView || document.hidden) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!disposed && inView && !document.hidden) renderer.render(scene, camera);
      });
    }
    function markPreset(name) {
      currentPreset = name;
      presetButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.anatomyView === name)));
      viewLabel.textContent = name ? name.charAt(0).toUpperCase() + name.slice(1) + ' view' : 'Free rotation';
    }
    function preset(name) {
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = name === 'side' ? size.z : size.x;
      const vertical = name === 'top' ? size.z : size.y;
      const depth = name === 'front' ? size.z : name === 'top' ? size.y : size.x;
      const distance = (Math.max(vertical / (2 * Math.tan(halfFov)), horizontal / (2 * Math.tan(halfFov) * camera.aspect)) + depth / 2) * 1.15;
      const positions = { front: [0, 0, distance], side: [distance, 0, 0.001], top: [0, -distance, 0.001] };
      camera.position.fromArray(positions[name]);
      controls.target.set(0, 0, 0);
      camera.lookAt(controls.target);
      controls.update();
      markPreset(name);
      render();
    }
    function setTouch(active) {
      touchActive = active;
      canvas.classList.toggle('is-touch-active', active);
      touchButton.setAttribute('aria-pressed', String(active));
      touchButton.textContent = active ? 'Done rotating' : 'Enable touch rotation';
      root.querySelector('.anatomy-mobile-help').textContent = active
        ? 'Drag to rotate · pinch to zoom'
        : 'Enable touch to rotate and pinch to zoom';
    }
    function updateLayers() {
      layerInputs.forEach(input => { parts[input.dataset.anatomyLayer].visible = input.checked; });
      parts.liver.material.opacity = 1 - Number(transparency.value) / 100;
      parts.liver.visible = byID('layer-liver').checked && Number(transparency.value) < 100;
      transparencyValue.textContent = transparency.value + '%';
      transparency.setAttribute('aria-valuetext', transparency.value + ' percent transparent');
      for (const part of Object.values(parts)) part.material.wireframe = wireframe.checked;
      render();
    }
    function reset() {
      layerInputs.forEach(input => { input.checked = true; });
      transparency.value = '65';
      wireframe.checked = false;
      setTouch(false);
      updateLayers();
      preset('front');
    }
    function zoom(factor) {
      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
      render();
    }
    function rotate(horizontal, vertical) {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta += horizontal;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, 0.02, Math.PI - 0.02);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
      markPreset(null);
      render();
    }
    function resize() {
      const nextWidth = stage.clientWidth;
      const nextHeight = stage.clientHeight;
      if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) { render(); return; }
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (currentPreset) preset(currentPreset);
      render();
    }

    const onChange = () => render();
    const onStart = () => markPreset(null);
    controls.addEventListener('change', onChange);
    controls.addEventListener('start', onStart);
    presetButtons.forEach(button => listen(button, 'click', () => preset(button.dataset.anatomyView)));
    layerInputs.forEach(input => listen(input, 'change', updateLayers));
    listen(transparency, 'input', updateLayers);
    listen(wireframe, 'change', updateLayers);
    listen(byID('reset'), 'click', reset);
    listen(byID('zoom-in'), 'click', () => zoom(0.86));
    listen(byID('zoom-out'), 'click', () => zoom(1 / 0.86));
    listen(touchButton, 'click', () => setTouch(!touchActive));
    listen(canvas, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const actions = {
        ArrowLeft: () => rotate(-0.12, 0), ArrowRight: () => rotate(0.12, 0),
        ArrowUp: () => rotate(0, -0.12), ArrowDown: () => rotate(0, 0.12),
        '+': () => zoom(0.86), '=': () => zoom(0.86), '-': () => zoom(1 / 0.86),
        r: reset, R: reset
      };
      if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
    });
    listen(canvas, 'webglcontextlost', event => {
      event.preventDefault();
      showFallback('The 3D view was interrupted. The static preview is still available; try loading the model again.');
    });
    listen(document, 'visibilitychange', () => { if (!document.hidden) render(); });
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(stage);
    else listen(window, 'resize', resize);
    resize();
    reset();

    return {
      resize, render,
      dispose() {
        disposed = true;
        if (frame) window.cancelAnimationFrame(frame);
        if (resizeObserver) resizeObserver.disconnect();
        listeners.forEach(remove => remove());
        controls.removeEventListener('change', onChange);
        controls.removeEventListener('start', onStart);
        controls.dispose();
        Object.values(parts).forEach(part => { part.geometry.dispose(); part.material.dispose(); });
        renderer.dispose();
        setTouch(false);
      }
    };
  }

  retry.addEventListener('click', initialise);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (!inView) return;
      if (runtime) runtime.render();
      else if (!root.dataset.state) initialise();
    }, { rootMargin: '200px 0px' });
    observer.observe(root);
  } else {
    inView = true;
    retry.hidden = false;
    status.textContent = 'Explore the prepared anatomy as an interactive 3D model.';
  }
})();

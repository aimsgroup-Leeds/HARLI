/* HARLI: patient-derived Couinaud segments, loaded when the anatomy section approaches the viewport. */
(() => {
  'use strict';

  const scriptURL = document.currentScript && document.currentScript.src;
  const baseURL = new URL('.', scriptURL || new URL('assets/couinaud/viewer.js', document.baseURI));
  const root = document.getElementById('anatomy-explainer');
  if (!root) return;

  const byID = suffix => document.getElementById('couinaud-' + suffix);
  const stage = document.getElementById('stage');
  const fallback = byID('fallback');
  const loading = byID('loading');
  const status = byID('status');
  const retry = byID('retry');
  const footer = byID('footer');
  const touchButton = byID('touch');
  const selectionLabel = byID('selection');
  const modeButtons = [...root.querySelectorAll('[data-couinaud-mode]')];
  const segmentButtons = [...root.querySelectorAll('#segList button')];
  const allButtons = [...root.querySelectorAll('button')];
  const libraryLoads = window.__harliViewerLibraryLoads || (window.__harliViewerLibraryLoads = new Map());
  const colours = [0xc9eef5, 0xb7e3c7, 0x4fa37a, 0x55b8d6, 0x7fd4b8, 0x3e8f6e, 0x8fd9c8, 0x1f6f8b];
  let canvas = document.getElementById('liver3d');
  let runtime = null;
  let pending = false;
  let nearby = false;

  root.classList.toggle('couinaud-has-touch', navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer:coarse)').matches);

  function loadScript(relativePath) {
    const url = new URL(relativePath, baseURL).href;
    if (libraryLoads.has(url)) return libraryLoads.get(url);
    const promise = new Promise((resolve, reject) => {
      let element = [...document.scripts].find(script => script.src === url);
      const existing = !!element;
      if (!element) element = document.createElement('script');
      const timer = window.setTimeout(fail, 20000);
      function cleanup() {
        window.clearTimeout(timer);
        element.removeEventListener('load', done);
        element.removeEventListener('error', fail);
      }
      function done() { cleanup(); resolve(); }
      function fail() {
        cleanup();
        if (!existing) element.remove();
        libraryLoads.delete(url);
        reject(new Error('The local 3D library could not load.'));
      }
      element.addEventListener('load', done, { once: true });
      element.addEventListener('error', fail, { once: true });
      if (!existing) {
        element.src = url;
        document.head.appendChild(element);
      }
    });
    libraryLoads.set(url, promise);
    return promise;
  }

  async function loadLibraries() {
    if (!window.THREE) await loadScript('../anatomy/vendor/three.min.js');
    if (!window.THREE || !window.THREE.WebGLRenderer) throw new Error('The 3D library is unavailable.');
    if (!window.THREE.OrbitControls) await loadScript('../anatomy/vendor/OrbitControls.js');
  }

  async function loadModel() {
    const abort = new AbortController();
    const timer = window.setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch(new URL('model.json', baseURL), { signal: abort.signal });
      if (!response.ok) throw new Error('The segment model could not load.');
      const data = await response.json();
      function validGeometry(mesh) {
        return mesh && Array.isArray(mesh.positions) && mesh.positions.length >= 9 &&
          mesh.positions.length % 3 === 0 && mesh.positions.every(Number.isFinite) &&
          Array.isArray(mesh.indices) && mesh.indices.length >= 3 && mesh.indices.length % 3 === 0 &&
          mesh.indices.every(index => Number.isInteger(index) && index >= 0 && index < mesh.positions.length / 3);
      }
      if (!Array.isArray(data.segments) || data.segments.length !== 8 || !validGeometry(data.surface) ||
          !data.segments.every(validGeometry) ||
          ![1, 2, 3, 4, 5, 6, 7, 8].every(id => data.segments.filter(segment => segment.id === id).length === 1)) {
        throw new Error('The segment model data is incomplete.');
      }
      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function setEnabled(enabled) {
    allButtons.forEach(button => { if (button !== retry) button.disabled = !enabled; });
  }

  function showFallback(message) {
    if (runtime) { runtime.dispose(); runtime = null; }
    root.dataset.couinaudState = 'error';
    stage.setAttribute('aria-busy', 'false');
    setEnabled(false);
    canvas.hidden = true;
    fallback.hidden = false;
    footer.hidden = true;
    loading.hidden = false;
    status.textContent = message;
    retry.hidden = false;
    retry.textContent = 'Try loading 3D again';
    selectionLabel.textContent = 'Static preview';
  }

  async function initialise() {
    if (pending || runtime) return;
    pending = true;
    root.dataset.couinaudState = 'loading';
    stage.setAttribute('aria-busy', 'true');
    setEnabled(false);
    status.textContent = 'Loading the eight liver segments…';
    retry.hidden = true;
    const freshCanvas = canvas.cloneNode(false);
    canvas.replaceWith(freshCanvas);
    canvas = freshCanvas;
    try {
      const [, data] = await Promise.all([loadLibraries(), loadModel()]);
      runtime = createViewer(data);
      root.dataset.couinaudState = 'ready';
      stage.setAttribute('aria-busy', 'false');
      setEnabled(true);
      canvas.hidden = false;
      fallback.hidden = true;
      loading.hidden = true;
      footer.hidden = false;
      runtime.resize();
    } catch (error) {
      showFallback(/WebGL|context|graphics/i.test(error.message)
        ? 'Interactive 3D is unavailable in this browser. The patient-derived model is shown in this preview.'
        : 'The interactive model could not load. The preview remains available.');
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
    renderer.setClearColor(0x0b1b20, 1);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    scene.add(new THREE.HemisphereLight(0xe1efff, 0x27403b, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(-2, 3, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc4dbff, 0.3);
    fill.position.set(3, 0, -2);
    scene.add(fill);

    const group = new THREE.Group();
    const parts = new Map();
    function createMesh(source, colour) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(source.positions, 3));
      geometry.setIndex(source.indices);
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colour).convertSRGBToLinear(), roughness: 0.8, metalness: 0, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
      return mesh;
    }
    for (const segment of data.segments) {
      const mesh = createMesh(segment, colours[segment.id - 1]);
      mesh.userData.segmentID = segment.id;
      parts.set(segment.id, mesh);
    }
    const surface = createMesh(data.surface, 0xb3cdbd);
    scene.add(group);
    const bounds = new THREE.Box3().setFromObject(group);
    group.position.sub(bounds.getCenter(new THREE.Vector3()));
    const size = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(bounds.getBoundingSphere(new THREE.Sphere()).radius, 0.01);
    camera.near = radius / 100;
    camera.far = radius * 100;

    const listeners = [];
    function listen(element, name, handler, options) {
      element.addEventListener(name, handler, options);
      listeners.push(() => element.removeEventListener(name, handler, options));
    }
    let touchActive = false;
    // OrbitControls registers non-passive touch handlers. Stop them before they
    // can prevent page scrolling unless the visitor explicitly enables rotation.
    listen(canvas, 'wheel', event => event.stopImmediatePropagation(), { capture: true, passive: true });
    for (const name of ['touchstart', 'touchmove']) {
      listen(canvas, name, event => { if (!touchActive) event.stopImmediatePropagation(); }, { capture: true, passive: true });
    }
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.rotateSpeed = 0.6;
    controls.minDistance = radius * 1.25;
    controls.maxDistance = radius * 14;
    controls.target.set(0, 0, 0);
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    let selectedID = null;
    let mode = 'segments';
    let defaultView = true;
    let frame = 0;
    let disposed = false;
    let width = 0;
    let height = 0;

    function render() {
      if (disposed || frame || !nearby || document.hidden) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!disposed && nearby && !document.hidden) renderer.render(scene, camera);
      });
    }
    function setTouch(active) {
      touchActive = active;
      canvas.classList.toggle('is-touch-active', active);
      touchButton.setAttribute('aria-pressed', String(active));
      touchButton.textContent = active ? 'Done rotating' : 'Enable touch rotation';
      byID('touch-help').textContent = active ? 'Drag to rotate · pinch to zoom' : 'Touch rotation is off · scroll freely';
    }
    function updateDisplay() {
      for (const [id, mesh] of parts) {
        mesh.visible = selectedID ? id === selectedID : mode !== 'surface';
        mesh.material.wireframe = mode === 'mesh';
      }
      surface.visible = mode === 'surface' && !selectedID;
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.couinaudMode === mode)));
      segmentButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.segmentId) === selectedID)));
      const selectedButton = segmentButtons.find(button => Number(button.dataset.segmentId) === selectedID);
      selectionLabel.textContent = selectedButton
        ? 'Segment ' + selectedButton.dataset.seg + ' · ' + selectedButton.querySelector('.seg-name').textContent
        : 'All eight segments';
      byID('show-all').hidden = !selectedID;
      canvas.setAttribute('aria-label', (selectedButton ? 'Isolated segment ' + selectedButton.dataset.seg : 'Eight Couinaud segments') +
        ', patient-derived 3D liver model. Use arrow keys to rotate, plus and minus to zoom, and R to reset.');
      render();
    }
    function select(id) {
      selectedID = selectedID === id ? null : id;
      if (mode === 'surface') mode = 'segments';
      updateDisplay();
    }
    function fit() {
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      // Leave space for the overlaid controls without clipping the anatomy.
      const usableHeight = Math.max(0.48, (height - 150) / height);
      const distance = Math.max(size.y / (2 * Math.tan(halfFov) * usableHeight),
        size.x / (2 * Math.tan(halfFov) * camera.aspect * 0.88)) + size.z * 0.7;
      camera.position.set(-distance * 0.1, distance * 0.12, distance);
      controls.target.set(0, 0, 0);
      controls.update();
      defaultView = true;
      render();
    }
    function reset() {
      selectedID = null;
      mode = 'segments';
      setTouch(false);
      updateDisplay();
      fit();
    }
    function zoom(factor) {
      const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance));
      controls.update();
      defaultView = false;
      render();
    }
    function rotate(horizontal, vertical) {
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      spherical.theta += horizontal;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, 0.02, Math.PI - 0.02);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
      defaultView = false;
      render();
    }
    function resize() {
      const nextWidth = stage.clientWidth;
      const nextHeight = stage.clientHeight;
      if (!nextWidth || !nextHeight) return;
      if (nextWidth === width && nextHeight === height) { render(); return; }
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (defaultView) fit();
      render();
    }

    const onChange = () => render();
    const onStart = () => { defaultView = false; };
    controls.addEventListener('change', onChange);
    controls.addEventListener('start', onStart);
    modeButtons.forEach(button => listen(button, 'click', () => {
      mode = button.dataset.couinaudMode;
      if (mode === 'surface') selectedID = null;
      updateDisplay();
    }));
    segmentButtons.forEach(button => listen(button, 'click', () => select(Number(button.dataset.segmentId))));
    listen(byID('show-all'), 'click', () => { selectedID = null; updateDisplay(); });
    listen(byID('reset'), 'click', reset);
    listen(byID('zoom-in'), 'click', () => zoom(0.86));
    listen(byID('zoom-out'), 'click', () => zoom(1 / 0.86));
    listen(touchButton, 'click', () => setTouch(!touchActive));
    listen(canvas, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.shiftKey && event.key !== '+')) return;
      const actions = {
        ArrowLeft: () => rotate(-0.12, 0), ArrowRight: () => rotate(0.12, 0),
        ArrowUp: () => rotate(0, -0.12), ArrowDown: () => rotate(0, 0.12),
        '+': () => zoom(0.86), '=': () => zoom(0.86), '-': () => zoom(1 / 0.86),
        r: reset, R: reset, Escape: () => setTouch(false)
      };
      if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
    });

    const raycaster = new THREE.Raycaster();
    let pointerStart = null;
    listen(canvas, 'pointerdown', event => {
      pointerStart = (!event.isPrimary || event.button !== 0 || event.pointerType === 'touch' && !touchActive)
        ? null : { x: event.clientX, y: event.clientY, id: event.pointerId };
    }, { passive: true });
    listen(canvas, 'pointercancel', () => { pointerStart = null; }, { passive: true });
    listen(canvas, 'pointerup', event => {
      if (!pointerStart || event.pointerId !== pointerStart.id) return;
      const start = pointerStart;
      pointerStart = null;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5 || mode === 'surface' && !selectedID) return;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1,
        -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      const hits = raycaster.intersectObjects([...parts.values()].filter(mesh => mesh.visible));
      if (hits.length) select(hits[0].object.userData.segmentID);
    }, { passive: true });
    listen(canvas, 'webglcontextlost', event => {
      event.preventDefault();
      showFallback('The 3D view was interrupted. The preview is still available; try loading the model again.');
    });
    listen(document, 'visibilitychange', () => { if (!document.hidden) render(); });
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(stage);
    else listen(window, 'resize', resize);
    resize();
    reset();

    return {
      resize, render,
      stopTouch: () => setTouch(false),
      dispose() {
        disposed = true;
        if (frame) window.cancelAnimationFrame(frame);
        if (resizeObserver) resizeObserver.disconnect();
        listeners.forEach(remove => remove());
        controls.removeEventListener('change', onChange);
        controls.removeEventListener('start', onStart);
        controls.dispose();
        [...parts.values(), surface].forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
        renderer.dispose();
        setTouch(false);
      }
    };
  }

  setEnabled(false);
  retry.addEventListener('click', initialise);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      nearby = entries[0].isIntersecting;
      if (!nearby) return;
      if (runtime) runtime.render();
      else if (!root.dataset.couinaudState) initialise();
    }, { rootMargin: '200px 0px' });
    observer.observe(root);
  } else {
    nearby = true;
    initialise();
  }
})();

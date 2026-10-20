/*
 * Animated contour background adapted from BrewedOps portfolio-template
 * v1.0.0-mit. Copyright (c) 2026 BrewedOps. MIT License.
 * Simplex noise: Copyright (c) 2011 Ashima Arts / Ian McEwan. MIT License.
 * See THIRD-PARTY-NOTICES.txt.
 */
(function () {
  'use strict';

  const canvas = document.querySelector('#contour-background');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });
  if (!gl) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const vertexSource = `#version 300 es
    precision highp float;
    out vec2 vUv;
    void main() {
      vec2 position = vec2(
        gl_VertexID == 1 ? 2.0 : 0.0,
        gl_VertexID == 2 ? 2.0 : 0.0
      );
      vUv = position * 0.5;
      gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
    }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMousePace;
    uniform float uAspect;
    uniform float uDarkMix;
    in vec2 vUv;
    out vec4 outputColor;

    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
      vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main(){
      vec2 uv=vUv;
      uv.x*=uAspect;

      vec2 mouse=uMouse*0.5+0.5;
      mouse.x*=uAspect;
      float cursor=clamp((1.0-distance(mouse,uv)*1.45)*uMousePace,0.0,1.0);

      float distortion=0.5+snoise(vec3(uv*0.52,uTime*0.1))*0.5;
      vec2 warped=(uv+cursor*0.05+distortion*0.48)*0.70;
      float noiseValue=snoise(vec3(warped,uTime));
      float bands=(noiseValue*0.5+0.5)*3.0;
      float distanceToLine=abs(fract(bands)-0.5);
      float lineWidth=fwidth(bands)*0.78;
      float line=1.0-smoothstep(0.0,lineWidth,distanceToLine);

      vec3 bgLight=vec3(0.9451,0.9608,0.9765);
      vec3 bgDark=vec3(0.0392,0.0588,0.2353);
      vec3 lineLight=vec3(0.0745,0.1137,0.7490);
      vec3 lineDark=vec3(0.3373,0.4157,0.9059);
      vec3 background=mix(bgLight,bgDark,uDarkMix);
      vec3 contourColor=mix(lineLight,lineDark,uDarkMix);

      float lineAlpha=line*mix(0.34,0.42,uDarkMix);
      vec3 color=mix(background,contourColor,lineAlpha);
      color+=cursor*mix(vec3(0.005,0.018,0.035),vec3(0.008,0.025,0.030),uDarkMix);
      outputColor=vec4(color,1.0);
    }
  `;

  function makeShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = makeShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = makeShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return;
  }

  gl.useProgram(program);
  const uniforms = {
    time: gl.getUniformLocation(program, 'uTime'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    pace: gl.getUniformLocation(program, 'uMousePace'),
    aspect: gl.getUniformLocation(program, 'uAspect'),
    dark: gl.getUniformLocation(program, 'uDarkMix')
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(pointer: coarse)');
  let targetMouse = {x: 0, y: 0};
  let currentMouse = {x: 0, y: 0};
  let lastMouse = {x: 0, y: 0};
  let pace = 0;
  let elapsed = 0;
  let targetDark = document.documentElement.dataset.theme === 'dark' ? 1 : 0;
  let darkMix = targetDark;
  let frame = 0;
  let visible = document.visibilityState !== 'hidden';
  let lastFrame = performance.now();
  let disposed = false;

  function resize() {
    const scale = coarsePointer.matches ? 0.8 : 1;
    const ratio = Math.min(devicePixelRatio || 1, scale);
    const width = Math.max(1, Math.round(innerWidth * ratio));
    const height = Math.max(1, Math.round(innerHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform1f(uniforms.aspect, innerWidth / Math.max(innerHeight, 1));
  }

  function readTheme() {
    targetDark = document.documentElement.dataset.theme === 'dark' ? 1 : 0;
  }

  function render(now) {
    if (disposed || !visible) return;
    frame = requestAnimationFrame(render);

    const interval = coarsePointer.matches ? 1000 / 20 : 1000 / 30;
    if (!reducedMotion.matches && now - lastFrame < interval - 1) return;
    const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;

    if (!reducedMotion.matches) elapsed += 0.065 * delta;
    const follow = 1 - Math.exp(-4 * delta);
    currentMouse.x += (targetMouse.x - currentMouse.x) * follow;
    currentMouse.y += (targetMouse.y - currentMouse.y) * follow;
    const dx = (currentMouse.x - lastMouse.x) / delta;
    const dy = (currentMouse.y - lastMouse.y) / delta;
    const velocity = coarsePointer.matches ? 0 : Math.min(1, Math.hypot(dx, dy) * 0.35);
    pace += (velocity - pace) * (1 - Math.exp(-8 * delta));
    lastMouse = {...currentMouse};
    darkMix += (targetDark - darkMix) * (1 - Math.exp(-7 * delta));

    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform2f(uniforms.mouse, currentMouse.x, currentMouse.y);
    gl.uniform1f(uniforms.pace, reducedMotion.matches ? 0 : pace);
    gl.uniform1f(uniforms.dark, darkMix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    document.documentElement.dataset.contourReady = 'true';

    if (reducedMotion.matches) cancelAnimationFrame(frame);
  }

  function restart() {
    cancelAnimationFrame(frame);
    lastFrame = performance.now();
    frame = requestAnimationFrame(render);
  }

  function onPointerMove(event) {
    if (coarsePointer.matches || reducedMotion.matches) return;
    targetMouse.x = event.clientX / innerWidth * 2 - 1;
    targetMouse.y = -(event.clientY / innerHeight * 2 - 1);
  }

  function onVisibilityChange() {
    visible = document.visibilityState !== 'hidden';
    if (visible) restart();
    else cancelAnimationFrame(frame);
  }

  const themeObserver = new MutationObserver(readTheme);
  themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  addEventListener('pointermove', onPointerMove, {passive: true});
  addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener?.('change', restart);
  coarsePointer.addEventListener?.('change', () => { resize(); restart(); });

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
  });
  canvas.addEventListener('webglcontextrestored', restart);

  resize();
  restart();

  addEventListener('pagehide', () => {
    disposed = true;
    cancelAnimationFrame(frame);
    themeObserver.disconnect();
    gl.deleteProgram(program);
  }, {once: true});
})();

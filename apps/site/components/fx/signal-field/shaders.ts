// GLSL for the hero particle field. Each particle carries four target positions
// (cloud, name, globe, radar) and the vertex shader blends between them on the GPU,
// so morphing 60k points costs one draw call and no per-frame CPU work.

// Simplex 3D noise, Ashima Arts / Stefan Gustavson (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uIntro;      // 0 cloud -> 1 name
uniform float uToGlobe;    // 0 name -> 1 globe
uniform float uToRadar;    // 0 globe -> 1 radar
uniform vec3 uMouse;       // cursor on the z=0 plane, world units
uniform float uMouseForce;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uTextScale;
uniform vec3 uTextCenter;
uniform vec3 uGlobeCenter;
uniform float uGlobeRadius;
uniform vec3 uRadarCenter;
uniform float uRadarRadius;

attribute vec3 aCloud;
attribute vec3 aText;
attribute vec3 aGlobe;
attribute vec3 aRadar;
attribute float aSeed;

varying vec3 vColor;
varying float vAlpha;

${noise}

mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}

float easeInOut(float t){return t<0.5?4.0*t*t*t:1.0-pow(-2.0*t+2.0,3.0)/2.0;}

void main(){
  // Stagger each particle's progress by its seed so shapes assemble as a wave, not a blink.
  float lag = aSeed * 0.35;
  float tIntro = easeInOut(clamp((uIntro * 1.35 - lag), 0.0, 1.0));
  float tGlobe = easeInOut(clamp((uToGlobe * 1.35 - lag), 0.0, 1.0));
  float tRadar = easeInOut(clamp((uToRadar * 1.35 - lag), 0.0, 1.0));

  float t = uTime;

  vec3 cloud = aCloud;
  cloud += 0.6 * vec3(
    snoise(aCloud * 0.25 + vec3(t * 0.05, 0.0, 0.0)),
    snoise(aCloud * 0.25 + vec3(0.0, t * 0.05, 7.1)),
    snoise(aCloud * 0.25 + vec3(3.3, 0.0, t * 0.05))
  );

  vec3 text = aText * vec3(uTextScale, 1.0) + uTextCenter;
  // The name breathes: a slow noise shimmer along z.
  text.z += 0.06 * snoise(vec3(aText.xy * 3.0, t * 0.4));

  vec3 globe = rotX(0.38) * rotY(t * 0.12) * (aGlobe * uGlobeRadius) + uGlobeCenter;

  vec3 radar = aRadar * uRadarRadius;
  radar.z += 0.05 * snoise(vec3(aRadar.xy * 4.0, t * 0.3));
  radar = rotX(-0.95) * radar + uRadarCenter;

  vec3 pos = mix(cloud, text, tIntro);
  pos = mix(pos, globe, tGlobe);
  pos = mix(pos, radar, tRadar);

  // In flight between shapes, particles drift through a noise field.
  float flight = sin(tIntro * 3.14159) + sin(tGlobe * 3.14159) + sin(tRadar * 3.14159);
  pos += flight * 0.45 * vec3(
    snoise(pos * 0.6 + t * 0.2),
    snoise(pos * 0.6 + 11.0 + t * 0.2),
    snoise(pos * 0.6 + 23.0 + t * 0.2)
  );

  // Cursor: push particles out of a soft disc and lift them toward the camera.
  vec2 d = pos.xy - uMouse.xy;
  float dist2 = dot(d, d);
  float field = exp(-dist2 / 0.55) * uMouseForce;
  pos.xy += normalize(d + 1e-5) * field * 0.75;
  pos.z += field * 0.9;

  // Radar sweep brightness, angle measured in the radar's own plane.
  float ang = atan(aRadar.y, aRadar.x);
  float sweep = mod(t * 1.4 - ang, 6.28318);
  float radarGlow = tRadar * (exp(-sweep * 1.8) * 1.1);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + field * 1.4 + radarGlow * 0.6);
  gl_PointSize = size * uPixelRatio * (10.0 / -mv.z);

  vec3 amber = vec3(1.0, 0.71, 0.28);
  vec3 cyan = vec3(0.37, 0.88, 1.0);
  vec3 hot = vec3(1.0, 0.95, 0.85);
  float isSignal = step(0.9, fract(aSeed * 13.17));
  vec3 col = mix(amber, cyan, isSignal);
  col = mix(col, hot, clamp(field * 0.9 + radarGlow * 0.5, 0.0, 1.0));
  vColor = col;
  float twinkle = 0.75 + 0.25 * sin(t * (1.0 + aSeed * 3.0) + aSeed * 40.0);
  vAlpha = twinkle * mix(0.55, 1.0, tIntro) * (1.0 - 0.35 * tRadar + radarGlow);
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(vColor * core * core * 1.6, vAlpha * core);
}
`;

// Final pass: subtle chromatic split toward the edges, vignette and scanlines.
export const finishShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uAberration;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      vec2 fromCenter = uv - 0.5;
      float edge = dot(fromCenter, fromCenter);
      vec2 shift = fromCenter * edge * uAberration;
      float r = texture2D(tDiffuse, uv + shift).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - shift).b;
      vec3 col = vec3(r, g, b);
      col *= 1.0 - smoothstep(0.18, 0.75, edge * 1.6);
      col *= 0.94 + 0.06 * sin(uv.y * uResolution.y * 1.5);
      col += (hash(uv * uResolution + uTime) - 0.5) * 0.025;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

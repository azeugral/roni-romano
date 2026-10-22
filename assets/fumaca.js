/* Fumaça leve do hero, à esquerda, em tons de creme e caramelo sobre preto.
   O canvas fica com mix-blend-mode:screen, então o preto some e só a fumaça aparece.
   Ao vivo no desktop; no celular o mesmo shader vira MP4 (tools/gerar_fumaca.py).
   `a` é a fase do loop (0 a 2π): o quadro em 2π é igual ao de 0, sem emenda. */
window.FUMACA_FS = `precision mediump float;
uniform vec2 r;uniform float a;uniform float k;uniform float lado;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,b=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=b*n(p);p=R*p*2.03;b*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.y; float asp=r.x/r.y; float x=gl_FragCoord.x/r.x, y=gl_FragCoord.y/r.y;
  vec2 o1=vec2(cos(a),sin(a))*k, o2=vec2(sin(a),cos(a))*k*.8;
  vec2 w=uv*vec2(1.1,1.6)+vec2(0.,-.15);
  vec2 q=vec2(fbm(w+o1),fbm(w+vec2(4.1,1.9)-o2));
  vec2 s=vec2(fbm(w+2.6*q+vec2(1.3,7.7)+o2),fbm(w+2.6*q+vec2(6.2,3.1)-o1*.7));
  float f=fbm(w+3.*s);
  float v=pow(smoothstep(.42,.92,f),2.2)*.75;
  float fio=smoothstep(.03,0.,abs(fbm(uv*2.3+s*2.)-.5))*.42*smoothstep(.3,.7,f);
  float m=mix(smoothstep(1.,.08,x),1.,lado);          // mais densa à esquerda
  m*=smoothstep(0.,.3,y)*smoothstep(1.08,.55,y);      // some em cima e embaixo
  v=(v+fio)*m;
  vec3 col=mix(vec3(.6,.42,.27),vec3(.95,.87,.76),clamp(v*1.6,0.,1.))*v*.72;
  gl_FragColor=vec4(col,1.);
}`;

/* Liga o shader num canvas. Devolve {desenhar(fase, raio)} ou null sem WebGL. */
window.fumacaGL = function (tela, opcoes) {
  const gl = tela.getContext('webgl', Object.assign({ antialias: false, alpha: false, powerPreference: 'low-power' }, opcoes || {}));
  if (!gl) return null;
  const sh = (tipo, src) => { const o = gl.createShader(tipo); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const v = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const f = sh(gl.FRAGMENT_SHADER, window.FUMACA_FS);
  if (!v || !f) return null;
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uA = gl.getUniformLocation(pr, 'a'), uK = gl.getUniformLocation(pr, 'k'), uL = gl.getUniformLocation(pr, 'lado');
  return {
    desenhar(fase, raio, lado) {
      gl.viewport(0, 0, tela.width, tela.height);
      gl.uniform2f(uR, tela.width, tela.height);
      gl.uniform1f(uA, fase); gl.uniform1f(uK, raio); gl.uniform1f(uL, lado || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
};
